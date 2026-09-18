"""Indicators router – CRUD-style read endpoints under /api/indicators."""

from __future__ import annotations

import csv
import io
import statistics
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.schemas import (
    IndicatorOut,
    IndicatorDetail,
    DataPoint,
    HistoricalDataOut,
    LatestValueOut,
    StatsOut,
)

router = APIRouter(prefix="/api/indicators", tags=["indicators"])


# ── helpers ──────────────────────────────────────────────────────────

def _get_indicator_or_404(code: str, db: Session) -> Indicator:
    """Retrieve an Indicator by its code, or raise 404."""
    ind = db.query(Indicator).filter(Indicator.code == code).first()
    if ind is None:
        raise HTTPException(status_code=404, detail=f"Indicator '{code}' not found")
    return ind


# ── endpoints ────────────────────────────────────────────────────────

@router.get("", response_model=list[IndicatorOut])
def list_indicators(db: Session = Depends(get_db)):
    """List all indicator metadata."""
    return db.query(Indicator).order_by(Indicator.id).all()


@router.get("/{code}", response_model=IndicatorDetail)
def get_indicator(code: str, db: Session = Depends(get_db)):
    """Single indicator metadata plus its latest value."""
    ind = _get_indicator_or_404(code, db)
    latest = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
        .order_by(desc(HistoricalData.period))
        .first()
    )
    return IndicatorDetail(
        id=ind.id,
        code=ind.code,
        name=ind.name,
        category=ind.category,
        source=ind.source,
        unit=ind.unit,
        description=ind.description,
        latest_value=latest.value if latest else None,
        latest_date=latest.period if latest else None,
    )


@router.get("/{code}/data", response_model=HistoricalDataOut)
def get_indicator_data(
    code: str,
    start_year: Optional[int] = Query(None, description="Start year filter"),
    end_year: Optional[int] = Query(None, description="End year filter"),
    db: Session = Depends(get_db),
):
    """Historical data for an indicator, optionally filtered by year range."""
    ind = _get_indicator_or_404(code, db)
    q = db.query(HistoricalData).filter(HistoricalData.indicator_id == ind.id)
    if start_year is not None:
        q = q.filter(HistoricalData.period >= str(start_year))
    if end_year is not None:
        q = q.filter(HistoricalData.period <= str(end_year))
    rows = q.order_by(HistoricalData.period).all()

    return HistoricalDataOut(
        code=ind.code,
        name=ind.name,
        unit=ind.unit,
        native_frequency=ind.native_frequency,
        data=[
            DataPoint(
                period=r.period,
                value=r.value,
                observation_time=r.observation_time.isoformat() if r.observation_time else None,
                publication_time=r.publication_time.isoformat() if r.publication_time else None,
                source_checked_time=r.source_checked_time.isoformat() if r.source_checked_time else None,
            )
            for r in rows
        ],
    )


@router.get("/{code}/latest", response_model=LatestValueOut)
def get_latest(code: str, db: Session = Depends(get_db)):
    """Latest value, previous value, and percentage change."""
    ind = _get_indicator_or_404(code, db)
    rows = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
        .order_by(desc(HistoricalData.period))
        .limit(2)
        .all()
    )
    cur = rows[0] if rows else None
    prev = rows[1] if len(rows) >= 2 else None

    pct_change = None
    if cur and prev and prev.value and prev.value != 0:
        pct_change = round((cur.value - prev.value) / abs(prev.value) * 100, 2)

    return LatestValueOut(
        code=ind.code,
        name=ind.name,
        unit=ind.unit,
        native_frequency=ind.native_frequency,
        current_value=cur.value if cur else None,
        current_period=cur.period if cur else None,
        previous_value=prev.value if prev else None,
        previous_period=prev.period if prev else None,
        pct_change=pct_change,
    )


@router.get("/{code}/stats", response_model=StatsOut)
def get_stats(code: str, db: Session = Depends(get_db)):
    """Summary statistics: count, mean, std, min, max, first_year, last_year."""
    ind = _get_indicator_or_404(code, db)
    rows = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
        .order_by(HistoricalData.period)
        .all()
    )
    values = [r.value for r in rows if r.value is not None]
    if not values:
        return StatsOut(code=ind.code, name=ind.name, unit=ind.unit)

    return StatsOut(
        code=ind.code,
        name=ind.name,
        unit=ind.unit,
        count=len(values),
        mean=round(statistics.mean(values), 4),
        std=round(statistics.stdev(values), 4) if len(values) >= 2 else None,
        min=round(min(values), 4),
        max=round(max(values), 4),
        first_year=int(rows[0].period[:4]) if rows and rows[0].period else None,
        last_year=int(rows[-1].period[:4]) if rows and rows[-1].period else None,
    )


@router.get("/{code}/export")
def export_csv(code: str, db: Session = Depends(get_db)):
    """Download indicator data as a CSV file."""
    ind = _get_indicator_or_404(code, db)
    rows = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id)
        .order_by(HistoricalData.period)
        .all()
    )

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["period", "value"])
    for r in rows:
        writer.writerow([r.period, r.value])
    buf.seek(0)

    filename = f"{code.replace('.', '_').replace('/', '_')}_data.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
