"""Status & Health Router – GET /api/status (EconoNigeria 2.0)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.database import get_db, engine
from app.models import Indicator, HistoricalData
from app.schemas.schemas import (
    SystemStatusOut,
    SourceStatus,
    EconomicPulse,
    PulseDriver,
)

router = APIRouter(prefix="/api", tags=["status"])

# Staleness thresholds in months, keyed by native_frequency.
_STALE_THRESHOLDS: dict[str | None, int] = {
    "Daily": 1,
    "Monthly": 3,
    "Quarterly": 9,
    "Annual": 24,
    None: 24,
}

KNOWN_SOURCES = [
    {
        "key": "world_bank",
        "name": "World Bank Indicators API",
        "source_match": "World Bank",
        "frequency": "Annual",
    },
    {
        "key": "fred",
        "name": "FRED (Federal Reserve)",
        "source_match": "FRED",
        "frequency": "Daily / Monthly (Annualized)",
    },
    {
        "key": "exchange_rate",
        "name": "Exchange Rate API",
        "source_match": "Exchange Rate API",
        "frequency": "Daily / Spot",
    },
    {
        "key": "acled",
        "name": "ACLED / Security Proxy",
        "source_match": "ACLED/Proxy",
        "frequency": "Annual",
    },
    {
        "key": "cbn",
        "name": "Central Bank of Nigeria (CBN)",
        "source_match": "CBN",
        "frequency": "Daily / Monthly (Upcoming)",
    },
    {
        "key": "nbs",
        "name": "National Bureau of Statistics (NBS)",
        "source_match": "NBS",
        "frequency": "Monthly / Quarterly (Upcoming)",
    },
]


def _compute_economic_pulse(db: Session) -> EconomicPulse:
    """Algorithmically calculate composite macroeconomic score (0-100)

    and identify key drivers based on the latest available data.
    """
    now_str = datetime.now(timezone.utc).isoformat()

    # Fetch latest observations for benchmark indicators
    codes = [
        "FP.CPI.TOTL.ZG",       # Inflation
        "NY.GDP.MKTP.KD.ZG",    # GDP Growth
        "GC.DOD.TOTL.GD.ZS",    # Debt to GDP
        "DCOILBRENTEU",         # Brent Oil Price
        "SL.UEM.TOTL.ZS",       # Unemployment
    ]

    latest_vals: dict[str, float] = {}
    for code in codes:
        point = (
            db.query(HistoricalData.value)
            .join(Indicator, HistoricalData.indicator_id == Indicator.id)
            .filter(Indicator.code == code, HistoricalData.value.isnot(None))
            .order_by(desc(HistoricalData.period))
            .first()
        )
        if point and point[0] is not None:
            latest_vals[code] = float(point[0])

    score = 50  # Base neutral baseline
    drivers: List[PulseDriver] = []

    # 1. Inflation Impact
    inf = latest_vals.get("FP.CPI.TOTL.ZG")
    if inf is not None:
        if inf > 25.0:
            score -= 16
            drivers.append(PulseDriver(indicator="Inflation Rate", direction="drag", impact=f"Elevated at {inf:.1f}%"))
        elif inf > 15.0:
            score -= 10
            drivers.append(PulseDriver(indicator="Inflation Rate", direction="drag", impact=f"Pressured at {inf:.1f}%"))
        elif inf < 10.0:
            score += 8
            drivers.append(PulseDriver(indicator="Inflation Rate", direction="support", impact=f"Moderate at {inf:.1f}%"))

    # 2. GDP Growth Impact
    gdp = latest_vals.get("NY.GDP.MKTP.KD.ZG")
    if gdp is not None:
        if gdp > 3.5:
            score += 12
            drivers.append(PulseDriver(indicator="GDP Growth", direction="support", impact=f"Expansionary at {gdp:.1f}%"))
        elif gdp > 1.5:
            score += 4
            drivers.append(PulseDriver(indicator="GDP Growth", direction="neutral", impact=f"Modest pace at {gdp:.1f}%"))
        else:
            score -= 14
            drivers.append(PulseDriver(indicator="GDP Growth", direction="drag", impact=f"Subdued at {gdp:.1f}%"))

    # 3. Brent Crude Price Impact (Major fiscal stabilizer for Nigeria)
    oil = latest_vals.get("DCOILBRENTEU")
    if oil is not None:
        if oil >= 75.0:
            score += 10
            drivers.append(PulseDriver(indicator="Brent Oil Price", direction="support", impact=f"Favorable revenue cushion (${oil:.1f}/bbl)"))
        elif oil < 65.0:
            score -= 8
            drivers.append(PulseDriver(indicator="Brent Oil Price", direction="drag", impact=f"Soft oil receipts (${oil:.1f}/bbl)"))

    # 4. Government Debt Impact
    debt = latest_vals.get("GC.DOD.TOTL.GD.ZS")
    if debt is not None:
        if debt > 50.0:
            score -= 8
            drivers.append(PulseDriver(indicator="Government Debt", direction="drag", impact=f"Debt service burden at {debt:.1f}% of GDP"))
        elif debt < 35.0:
            score += 6
            drivers.append(PulseDriver(indicator="Government Debt", direction="support", impact=f"Sustainable leverage at {debt:.1f}% of GDP"))

    # Bound score between 15 and 95
    score = max(15, min(95, score))

    if score >= 70:
        rating = "Resilient"
        summary = "Broad macroeconomic indicators reflect stable buffers, supported by fiscal receipts and economic expansion."
    elif score >= 55:
        rating = "Moderate"
        summary = "Economic performance shows balanced stability with moderate tailwinds offsetting structural friction."
    elif score >= 40:
        rating = "Strained"
        summary = "Macro conditions remain strained by consumer price inflation and currency pressure, despite resilient oil support."
    else:
        rating = "Vulnerable"
        summary = "Heightened macro vulnerability driven by cost-of-living surges, debt costs, and slow structural momentum."

    return EconomicPulse(
        score=score,
        rating=rating,
        summary=summary,
        drivers=drivers,
        last_computed=now_str,
    )


@router.get("/status", response_model=SystemStatusOut)
def get_system_status(db: Session = Depends(get_db)):
    """Return comprehensive system, pipeline health, and data freshness metrics."""
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()

    total_indicators = db.query(func.count(Indicator.id)).scalar() or 0
    total_observations = db.query(func.count(HistoricalData.id)).filter(HistoricalData.value.isnot(None)).scalar() or 0

    indicators = db.query(Indicator).all()
    stale_count = 0

    for ind in indicators:
        latest_pt = (
            db.query(HistoricalData.period)
            .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
            .order_by(desc(HistoricalData.period))
            .first()
        )
        if latest_pt and latest_pt[0]:
            try:
                yr = int(str(latest_pt[0])[:4])
                months_ago = (now.year - yr) * 12 + now.month
                threshold = _STALE_THRESHOLDS.get(ind.native_frequency, 24)
                if months_ago > threshold:
                    stale_count += 1
            except (ValueError, TypeError):
                stale_count += 1
        else:
            stale_count += 1

    freshness_pct = 0.0
    if total_indicators > 0:
        freshness_pct = round(((total_indicators - stale_count) / total_indicators) * 100, 1)

    # Build per-source statuses
    sources_out: List[SourceStatus] = []
    for src in KNOWN_SOURCES:
        # Find matching indicators
        matching_inds = [i for i in indicators if i.source == src["source_match"]]
        ind_count = len(matching_inds)

        if ind_count > 0:
            ind_ids = [i.id for i in matching_inds]
            src_obs_count = (
                db.query(func.count(HistoricalData.id))
                .filter(HistoricalData.indicator_id.in_(ind_ids), HistoricalData.value.isnot(None))
                .scalar() or 0
            )
            latest_obs = (
                db.query(HistoricalData)
                .filter(HistoricalData.indicator_id.in_(ind_ids), HistoricalData.value.isnot(None))
                .order_by(desc(HistoricalData.period))
                .first()
            )
            latest_period = latest_obs.period if latest_obs else None
            last_checked = (
                latest_obs.ingestion_time.isoformat()
                if latest_obs and latest_obs.ingestion_time
                else (latest_obs.source_checked_time.isoformat() if latest_obs and latest_obs.source_checked_time else None)
            )

            status = "operational" if src_obs_count > 0 else "degraded"
        else:
            src_obs_count = 0
            latest_period = None
            last_checked = None
            status = "in_development"

        sources_out.append(
            SourceStatus(
                key=src["key"],
                name=src["name"],
                status=status,
                native_frequency=src["frequency"],
                indicators_count=ind_count,
                total_observations=src_obs_count,
                latest_period=latest_period,
                last_checked=last_checked,
            )
        )

    # Calculate Economic Pulse
    pulse = _compute_economic_pulse(db)

    # Overall system status
    overall_status = "operational"
    if total_observations == 0 or stale_count >= total_indicators:
        overall_status = "degraded"

    return SystemStatusOut(
        status=overall_status,
        environment="production" if "postgresql" in engine.dialect.name else "local",
        database_engine=engine.dialect.name.capitalize(),
        timestamp=now_str,
        total_indicators=total_indicators,
        total_observations=total_observations,
        stale_indicators_count=stale_count,
        freshness_percentage=freshness_pct,
        sources=sources_out,
        economic_pulse=pulse,
    )
