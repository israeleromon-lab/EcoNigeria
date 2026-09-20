"""v1 Public REST API Router – Open Economic Intelligence for Nigeria.

Empowering researchers, fintech developers, and citizens with free,
un-paywalled macroeconomic data, projections, and intelligence.
"""

from __future__ import annotations

import csv
import io
import statistics
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.forecast import ForecastingEngine
from app.routers.status import _compute_economic_pulse

router = APIRouter(prefix="/v1", tags=["v1 - Public API"])

# Bidirectional mapping between indicator codes and human-readable slugs
CODE_TO_SLUG: Dict[str, str] = {
    "SP.POP.TOTL": "population",
    "NY.GDP.PCAP.CD": "gdp-per-capita",
    "FP.CPI.TOTL.ZG": "inflation",
    "NY.GDP.MKTP.KD.ZG": "gdp-growth",
    "SL.UEM.TOTL.ZS": "unemployment",
    "GC.DOD.TOTL.GD.ZS": "debt-to-gdp",
    "BX.KLT.DINV.CD.WD": "fdi",
    "DCOILBRENTEU": "brent-oil",
    "FEDFUNDS": "fed-funds",
    "NGN_USD": "exchange-rate",
    "SI.POV.NAHC": "poverty-rate",
    "NG.SEC.INCIDENTS": "insecurity",
}
SLUG_TO_CODE: Dict[str, str] = {v: k for k, v in CODE_TO_SLUG.items()}

# Curated Nigerian macroeconomic policy & shock events for API consumption
CURATED_EVENTS: List[Dict[str, Any]] = [
    {
        "id": "rate-hikes-2024",
        "year": "2024",
        "date": "Feb – Jul 2024",
        "title": "Aggressive Monetary Tightening Cycle",
        "category": "Monetary Policy",
        "description": "CBN instituted record interest rate hikes, pushing MPR from 18.75% to 26.75% to anchor inflation.",
        "indicators": ["inflation", "exchange-rate", "fed-funds", "gdp-growth"]
    },
    {
        "id": "subsidy-fx-float-2023",
        "year": "2023",
        "date": "May – Jun 2023",
        "title": "Fuel Subsidy Removal & Naira Float",
        "category": "Structural Reform",
        "description": "Immediate end to petrol subsidy in May and floating of official exchange rate in June 2023.",
        "indicators": ["inflation", "exchange-rate", "poverty-rate", "debt-to-gdp", "gdp-per-capita", "gdp-growth"]
    },
    {
        "id": "naira-redesign-2022",
        "year": "2022",
        "date": "Oct 2022 – Feb 2023",
        "title": "Currency Redesign & Cash Crunch",
        "category": "Monetary Policy",
        "description": "Redesign of 200, 500, and 1,000 Naira banknotes triggering acute liquidity shortages across the informal economy.",
        "indicators": ["inflation", "gdp-growth", "unemployment"]
    },
    {
        "id": "covid-oil-shock-2020",
        "year": "2020",
        "date": "Mar – Nov 2020",
        "title": "COVID-19 Lockdown & Global Crude Crash",
        "category": "External Shock",
        "description": "Brent crude plunged below $20/barrel, border closures and lockdown pushed Nigeria into recession (-1.8%).",
        "indicators": ["gdp-growth", "brent-oil", "exchange-rate", "unemployment", "poverty-rate", "debt-to-gdp", "fdi"]
    },
    {
        "id": "recession-deval-2016",
        "year": "2016",
        "date": "Jun 2016",
        "title": "Naira Devaluation & 2016 Recession",
        "category": "Commodity Shock",
        "description": "Oil receipts plunge forced abandonment of 197 NGN/USD peg; Nigeria entered first recession in 25 years (-1.6%).",
        "indicators": ["gdp-growth", "inflation", "exchange-rate", "brent-oil", "unemployment"]
    },
    {
        "id": "oil-price-crash-2014",
        "year": "2014",
        "date": "Jul – Dec 2014",
        "title": "Global Crude Oil Market Collapse",
        "category": "Commodity Shock",
        "description": "Brent crude plunged from $115 to under $50/barrel as US shale boom wiped out excess crude fiscal buffers.",
        "indicators": ["brent-oil", "exchange-rate", "debt-to-gdp", "gdp-growth", "fdi"]
    },
    {
        "id": "occupy-nigeria-2012",
        "year": "2012",
        "date": "Jan 2012",
        "title": "Occupy Nigeria Subsidy Protests",
        "category": "Fiscal Policy",
        "description": "Attempted overnight removal of petrol subsidies sparked nationwide strikes and civil protests.",
        "indicators": ["inflation", "gdp-growth", "insecurity"]
    },
    {
        "id": "global-financial-crisis-2008",
        "year": "2008",
        "date": "Sep 2008",
        "title": "Global Financial Crisis & Banking Bailout",
        "category": "External Shock",
        "description": "Global credit freeze hit crude demand and foreign portfolio inflows; CBN injected 620B Naira into distressed banks.",
        "indicators": ["gdp-growth", "brent-oil", "debt-to-gdp", "fdi", "fed-funds"]
    },
    {
        "id": "paris-club-debt-2005",
        "year": "2005",
        "date": "Oct 2005",
        "title": "Historic Paris Club Debt Relief Deal",
        "category": "Fiscal Policy",
        "description": "Nigeria finalized an $18 billion debt cancellation deal extinguishing $30B of external bilateral liabilities.",
        "indicators": ["debt-to-gdp", "fdi", "gdp-per-capita", "gdp-growth"]
    }
]


def _resolve_indicator(identifier: str, db: Session) -> Indicator:
    """Resolve an indicator by human slug (e.g. 'inflation') or code (e.g. 'FP.CPI.TOTL.ZG')."""
    normalized = identifier.strip().lower()
    
    # Check slug alias
    code_from_slug = SLUG_TO_CODE.get(normalized)
    target_code = code_from_slug or identifier.strip()

    ind = db.query(Indicator).filter(
        func.lower(Indicator.code) == target_code.lower()
    ).first()

    if ind is None:
        valid_options = list(SLUG_TO_CODE.keys())
        raise HTTPException(
            status_code=404, 
            detail=f"Indicator '{identifier}' not found. Supported slugs include: {', '.join(valid_options[:6])}..."
        )
    return ind


# ── 1. API Root & Documentation Index ────────────────────────────────

@router.get("")
def get_api_root():
    """v1 Public API Directory & Overview."""
    return {
        "service": "EconoNigeria Public REST API",
        "version": "v1",
        "documentation": "/developers",
        "open_access": True,
        "authentication": "None required (Public Open Data)",
        "license": "MIT / Creative Commons Attribution 4.0",
        "endpoints": {
            "indicators": "/v1/indicators",
            "indicator_detail": "/v1/indicators/{slug_or_code}",
            "historical_data": "/v1/indicators/{slug_or_code}/history",
            "economic_pulse": "/v1/pulse",
            "forecasts": "/v1/forecasts/{slug_or_code}",
            "events": "/v1/events",
        }
    }


# ── 2. Indicators Catalog ────────────────────────────────────────────

@router.get("/indicators")
def list_indicators_v1(db: Session = Depends(get_db)):
    """List all available macroeconomic series with latest snapshots and provenance."""
    indicators = db.query(Indicator).order_by(Indicator.id).all()
    results = []

    for ind in indicators:
        slug = CODE_TO_SLUG.get(ind.code, ind.code.lower())
        
        # Get latest observation
        latest = (
            db.query(HistoricalData)
            .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
            .order_by(desc(HistoricalData.period))
            .first()
        )

        results.append({
            "slug": slug,
            "code": ind.code,
            "name": ind.name,
            "category": ind.category,
            "unit": ind.unit,
            "source": ind.source,
            "native_frequency": ind.native_frequency,
            "latest_value": latest.value if latest else None,
            "latest_period": latest.period if latest else None,
            "last_updated": (
                latest.ingestion_time.isoformat() if latest and latest.ingestion_time else None
            ),
        })

    return {
        "count": len(results),
        "indicators": results
    }


# ── 3. Single Indicator Detail ───────────────────────────────────────

@router.get("/indicators/{identifier}")
def get_indicator_v1(identifier: str, db: Session = Depends(get_db)):
    """Get metadata and statistical summary for a single indicator."""
    ind = _resolve_indicator(identifier, db)
    slug = CODE_TO_SLUG.get(ind.code, ind.code.lower())

    points = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
        .order_by(HistoricalData.period.asc())
        .all()
    )

    values = [p.value for p in points if p.value is not None]
    count = len(values)

    stats = None
    if count > 0:
        stats = {
            "count": count,
            "mean": round(statistics.mean(values), 2),
            "std": round(statistics.stdev(values), 2) if count > 1 else 0.0,
            "min": min(values),
            "max": max(values),
            "earliest_period": points[0].period,
            "latest_period": points[-1].period,
            "latest_value": points[-1].value,
        }

    return {
        "slug": slug,
        "code": ind.code,
        "name": ind.name,
        "category": ind.category,
        "unit": ind.unit,
        "source": ind.source,
        "native_frequency": ind.native_frequency,
        "description": ind.description,
        "statistics": stats
    }


# ── 4. Historical Time-Series (JSON & CSV) ───────────────────────────

@router.get("/indicators/{identifier}/history")
def get_indicator_history_v1(
    identifier: str,
    start_year: Optional[int] = Query(default=None),
    end_year: Optional[int] = Query(default=None),
    format: str = Query(default="json", regex="^(json|csv)$"),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological time series with optional date filtering and CSV export."""
    ind = _resolve_indicator(identifier, db)
    slug = CODE_TO_SLUG.get(ind.code, ind.code.lower())

    query = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == ind.id, HistoricalData.value.isnot(None))
        .order_by(HistoricalData.period.asc())
    )

    rows = query.all()

    # In-memory filter for flexible period formatting
    filtered = []
    for r in rows:
        try:
            yr = int(str(r.period)[:4])
            if start_year and yr < start_year:
                continue
            if end_year and yr > end_year:
                continue
            filtered.append(r)
        except (ValueError, TypeError):
            filtered.append(r)

    # Stream CSV if requested
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["period", "value", "unit", "indicator_code", "indicator_slug", "indicator_name"])
        for r in filtered:
            writer.writerow([r.period, r.value, ind.unit, ind.code, slug, ind.name])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={slug}_history.csv"}
        )

    # Otherwise return JSON
    return {
        "slug": slug,
        "code": ind.code,
        "name": ind.name,
        "unit": ind.unit,
        "observations_count": len(filtered),
        "data": [
            {
                "period": r.period,
                "value": r.value,
                "observation_time": r.observation_time,
            }
            for r in filtered
        ]
    }


# ── 5. Real-Time Economic Pulse ──────────────────────────────────────

@router.get("/pulse")
def get_economic_pulse_v1(db: Session = Depends(get_db)):
    """Retrieve the real-time composite Economic Pulse (0-100) and macro driver breakdown."""
    pulse = _compute_economic_pulse(db)
    return {
        "composite_score": pulse.score,
        "rating": pulse.rating,
        "summary": pulse.summary,
        "drivers": [
            {
                "indicator": d.indicator,
                "direction": d.direction,
                "impact": d.impact,
            }
            for d in pulse.drivers
        ],
        "last_computed": pulse.last_computed,
    }


# ── 6. Multi-Model Forecasts ─────────────────────────────────────────

@router.get("/forecasts/{identifier}")
def get_forecast_v1(
    identifier: str,
    periods: int = Query(default=5, ge=1, le=10),
    model: str = Query(default="ensemble", regex="^(ensemble|prophet|arima)$"),
    shock_pct: float = Query(default=0.0, ge=-50.0, le=50.0),
    db: Session = Depends(get_db)
):
    """Retrieve forward time-series projections with backtest accuracy and scenario simulation."""
    ind = _resolve_indicator(identifier, db)
    slug = CODE_TO_SLUG.get(ind.code, ind.code.lower())

    hist_data = (
        db.query(HistoricalData)
        .filter(
            HistoricalData.indicator_id == ind.id,
            HistoricalData.country_code == "NGA",
            HistoricalData.value.isnot(None),
        )
        .order_by(HistoricalData.period.asc())
        .all()
    )

    data_dicts = [
        {"period": str(row.period), "value": row.value}
        for row in hist_data
        if row.period and row.value is not None
    ]

    if len(data_dicts) < 5:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient historical observations for modeling (minimum 5 points required)"
        )

    engine = ForecastingEngine(data_dicts)
    result = engine.generate_forecast(
        periods=periods, 
        model_choice=model, 
        shock_pct=shock_pct
    )

    return {
        "slug": slug,
        "code": ind.code,
        "name": ind.name,
        "unit": ind.unit,
        "model_used": result.get("model_used"),
        "periods_forecasted": periods,
        "shock_applied_pct": shock_pct,
        "evaluation": result.get("evaluation"),
        "model_card": result.get("model_card"),
        "forecast": result.get("forecast"),
    }


# ── 7. Macroeconomic Policy & Shock Events ───────────────────────────

@router.get("/events")
def get_events_v1(
    category: Optional[str] = Query(default=None),
    indicator: Optional[str] = Query(default=None),
):
    """Retrieve curated Nigerian macroeconomic policy shifts, reforms, and commodity shocks."""
    events = CURATED_EVENTS

    if category:
        events = [e for e in events if e["category"].lower() == category.lower()]

    if indicator:
        ind_clean = indicator.lower().strip()
        events = [e for e in events if ind_clean in [i.lower() for i in e["indicators"]]]

    return {
        "count": len(events),
        "events": events
    }
