"""Dashboard router – GET /api/dashboard."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.schemas import DashboardOut, DashboardIndicator, SparklinePoint

router = APIRouter(prefix="/api", tags=["dashboard"])

# Staleness thresholds in months, keyed by native_frequency.
_STALE_THRESHOLDS: dict[str | None, int] = {
    "Daily": 1,
    "Monthly": 3,
    "Quarterly": 9,
    "Annual": 24,
    None: 24,
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


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    """Return every indicator with its latest value, previous value,
    percentage change, provenance metadata, and a sparkline of the
    last 10 data points.
    """

    indicators = db.query(Indicator).order_by(Indicator.id).all()
    results: list[DashboardIndicator] = []

    for ind in indicators:
        # HistoricalData stores the observation key as `period`, not `date`.
        points = (
            db.query(HistoricalData)
            .filter(
                HistoricalData.indicator_id == ind.id,
                HistoricalData.value.isnot(None),
            )
            .order_by(desc(HistoricalData.period))
            .limit(10)
            .all()
        )
        points.reverse()  # oldest → newest

        sparkline = [
            SparklinePoint(period=p.period, value=p.value)
            for p in points
        ]

        current_value = points[-1].value if points else None
        current_period = points[-1].period if points else None
        previous_value = points[-2].value if len(points) >= 2 else None
        previous_period = points[-2].period if len(points) >= 2 else None

        pct_change = None
        if (
            current_value is not None
            and previous_value is not None
            and previous_value != 0
        ):
            pct_change = round(
                (current_value - previous_value) / abs(previous_value) * 100,
                2,
            )

        # Provenance: last ingestion time from the latest data point
        last_updated = None
        if points:
            latest_point = points[-1]
            if latest_point.ingestion_time:
                last_updated = latest_point.ingestion_time.isoformat()
            elif latest_point.source_checked_time:
                last_updated = latest_point.source_checked_time.isoformat()

        freq = ind.native_frequency
        stale = _is_stale(current_period, freq)

        results.append(
            DashboardIndicator(
                code=ind.code,
                name=ind.name,
                category=ind.category,
                unit=ind.unit,
                source=ind.source,
                native_frequency=freq,
                current_value=current_value,
                current_period=current_period,
                previous_value=previous_value,
                previous_period=previous_period,
                pct_change=pct_change,
                last_updated=last_updated,
                is_stale=stale,
                sparkline=sparkline,
            )
        )

    return DashboardOut(indicators=results)
