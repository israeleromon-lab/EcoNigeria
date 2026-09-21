from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.ai_analyst import AIAnalystEngine
from app.services.signals import detect_economic_signals
from app.routers.status import _compute_economic_pulse

router = APIRouter(prefix="/api/analyst", tags=["ai_analyst"])


class BriefRequest(BaseModel):
    topic: str = "Macro Diagnostic"


def _build_macro_context(db: Session) -> dict:
    """Extract comprehensive, verified macroeconomic database state for Gemini grounding."""
    indicators = db.query(Indicator).order_by(Indicator.id).all()
    indicator_summary = []

    for ind in indicators:
        hist_data = (
            db.query(HistoricalData)
            .filter(
                HistoricalData.indicator_id == ind.id,
                HistoricalData.country_code == "NGA",
                HistoricalData.value.isnot(None),
            )
            .order_by(desc(HistoricalData.period))
            .limit(3)
            .all()
        )
        if hist_data:
            latest = hist_data[0]
            prev = hist_data[1] if len(hist_data) > 1 else None
            indicator_summary.append({
                "name": ind.name,
                "code": ind.code,
                "category": ind.category,
                "unit": ind.unit,
                "source": ind.source,
                "latest_period": latest.period,
                "latest_value": latest.value,
                "previous_period": prev.period if prev else None,
                "previous_value": prev.value if prev else None,
            })

    # Economic Pulse
    pulse_obj = _compute_economic_pulse(db)
    pulse_dict = {
        "score": pulse_obj.score,
        "rating": pulse_obj.rating,
        "summary": pulse_obj.summary,
        "drivers": [{"indicator": d.indicator, "direction": d.direction, "impact": d.impact} for d in pulse_obj.drivers],
    }

    # Economic Signals
    signals = detect_economic_signals(db)

    return {
        "indicators": indicator_summary,
        "pulse": pulse_dict,
        "signals": signals,
    }


@router.get("/report")
def get_ai_report(
    topic: Optional[str] = Query("Macro Diagnostic", description="Brief topic/angle"),
    db: Session = Depends(get_db)
):
    """Generate an AI analyst report strictly grounded in all verified database indicators and signals."""
    context = _build_macro_context(db)
    report = AIAnalystEngine().generate_grounded_brief(context, topic=topic)

    return {
        "success": True,
        "report": report,
        "data_available": bool(context["indicators"]),
        "context_summary": {
            "indicators_evaluated": len(context["indicators"]),
            "signals_detected": len(context["signals"]),
            "pulse_score": context["pulse"]["score"],
        }
    }


@router.post("/brief")
def generate_custom_brief(
    request: BriefRequest,
    db: Session = Depends(get_db)
):
    """Generate an on-demand specialized policy brief on a chosen macroeconomic topic."""
    context = _build_macro_context(db)
    report = AIAnalystEngine().generate_grounded_brief(context, topic=request.topic)

    return {
        "success": True,
        "report": report,
    }

