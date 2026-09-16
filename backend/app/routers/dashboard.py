"""Dashboard router – GET /api/dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.schemas import DashboardOut, DashboardIndicator, SparklinePoint

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    """Return every indicator with its latest value, previous value,
    percentage change, and a sparkline of the last 10 data points.
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

        results.append(
            DashboardIndicator(
                code=ind.code,
                name=ind.name,
                category=ind.category,
                unit=ind.unit,
                current_value=current_value,
                current_period=current_period,
                previous_value=previous_value,
                previous_period=previous_period,
                pct_change=pct_change,
                sparkline=sparkline,
            )
        )

    return DashboardOut(indicators=results)
