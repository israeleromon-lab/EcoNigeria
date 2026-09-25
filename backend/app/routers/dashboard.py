"""Dashboard router – GET /api/dashboard and GET /api/dashboard/summary."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.schemas import (
    DashboardOut,
    DashboardIndicator,
    DashboardSummaryItem,
    DashboardSummaryOut,
    SparklinePoint,
)

router = APIRouter(prefix="/api", tags=["dashboard"])

# Staleness thresholds in months, keyed by native_frequency.
_STALE_THRESHOLDS: dict[str | None, int] = {
    "Daily": 1,
    "Monthly": 3,
    "Quarterly": 9,
    "Annual": 24,
    None: 24,
}

# Institutional source provenance mapping for Nigerian & global series
_PROVENANCE_OVERRIDES: dict[str, tuple[str, str]] = {
    "FP.CPI.TOTL.ZG": ("NBS", "Monthly"),
    "NY.GDP.MKTP.KD.ZG": ("NBS", "Quarterly"),
    "FI.RES.TOTL.CD": ("CBN", "Monthly"),
    "NGN_USD": ("CBN", "Daily"),
    "DCOILBRENTEU": ("FRED", "Daily"),
    "FEDFUNDS": ("FRED", "Monthly"),
}


def _is_stale(period: str | None, frequency: str | None) -> bool:
    """Return True if the latest observation period is too old."""
    if not period:
        return True
    try:
        year = int(period[:4])
    except (ValueError, TypeError):
        return True
    now = datetime.now(timezone.utc)
    months_ago = (now.year - year) * 12 + now.month
    threshold = _STALE_THRESHOLDS.get(frequency, 24)
    return months_ago > threshold


def _build_dashboard_items(db: Session) -> tuple[list[DashboardIndicator], list[DashboardSummaryItem]]:
    indicators = db.query(Indicator).order_by(Indicator.id).all()
    indicators_out: list[DashboardIndicator] = []
    summary_out: list[DashboardSummaryItem] = []

    for ind in indicators:
        points = (
            db.query(HistoricalData)
            .filter(
                HistoricalData.indicator_id == ind.id,
                HistoricalData.value.isnot(None),
            )
            .order_by(desc(HistoricalData.period))
            .limit(15)
            .all()
        )
        points.reverse()  # oldest → newest

        sparkline_pts = [
            SparklinePoint(period=p.period, value=p.value)
            for p in points
        ]
        sparkline_vals = [
            round(float(p.value), 4)
            for p in points
            if p.value is not None
        ]

        current_value = points[-1].value if points else None
        current_period = points[-1].period if points else None
        previous_value = points[-2].value if len(points) >= 2 else None
        previous_period = points[-2].period if len(points) >= 2 else None

        pct_change = None
        abs_change = None
        bps_change = None
        if current_value is not None and previous_value is not None:
            abs_change = round(current_value - previous_value, 4)
            if ind.unit and "%" in ind.unit:
                bps_change = int(round((current_value - previous_value) * 100))
            if previous_value != 0:
                pct_change = round(
                    (current_value - previous_value) / abs(previous_value) * 100,
                    2,
                )

        last_updated = None
        if points:
            latest_point = points[-1]
            if latest_point.ingestion_time:
                last_updated = latest_point.ingestion_time.isoformat()
            elif latest_point.source_checked_time:
                last_updated = latest_point.source_checked_time.isoformat()

        override_source, override_freq = _PROVENANCE_OVERRIDES.get(
            ind.code, (ind.source or "World Bank", ind.native_frequency or "Annual")
        )
        source = override_source or ind.source or "World Bank"
        freq = override_freq or ind.native_frequency or "Annual"
        stale = _is_stale(current_period, ind.native_frequency or freq)

        indicators_out.append(
            DashboardIndicator(
                code=ind.code,
                name=ind.name,
                category=ind.category,
                unit=ind.unit,
                source=source,
                native_frequency=freq,
                current_value=current_value,
                current_period=current_period,
                previous_value=previous_value,
                previous_period=previous_period,
                pct_change=pct_change,
                abs_change=abs_change,
                bps_change=bps_change,
                last_updated=last_updated,
                is_stale=stale,
                sparkline=sparkline_pts,
                sparkline_values=sparkline_vals,
            )
        )

        summary_out.append(
            DashboardSummaryItem(
                code=ind.code,
                name=ind.name,
                category=ind.category,
                unit=ind.unit,
                source=source,
                native_frequency=freq,
                current_value=current_value,
                current_period=current_period,
                previous_value=previous_value,
                previous_period=previous_period,
                pct_change=pct_change,
                abs_change=abs_change,
                bps_change=bps_change,
                last_updated=last_updated,
                is_stale=stale,
                sparkline=sparkline_vals,
                sparkline_points=sparkline_pts,
            )
        )

    return indicators_out, summary_out


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    """Return every indicator with its latest value, previous value,
    percentage/bps change, provenance metadata, and a sparkline of the
    last 15 historical data points.
    """
    indicators_out, _ = _build_dashboard_items(db)
    return DashboardOut(indicators=indicators_out)


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Return dashboard summary items with `sparkline: List[float]` (trailing 15 observations)
    and institutional provenance (`source`, `native_frequency`).
    """
    _, summary_out = _build_dashboard_items(db)
    return DashboardSummaryOut(indicators=summary_out)

