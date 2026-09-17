from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.ai_analyst import AIAnalystEngine

router = APIRouter(prefix="/api/analyst", tags=["ai_analyst"])

@router.get("/report")
def get_ai_report(db: Session = Depends(get_db)):
    """Generate an AI analyst report from available macro data.

    If the required Nigeria indicators are not yet present in the database,
    we still return a fallback report instead of crashing the frontend with a
    404 / red error state.
    """
    key_codes = ["NY.GDP.PCAP.CD", "FP.CPI.TOTL.ZG", "SP.POP.TOTL", "SL.UEM.TOTL.ZS"]

    data_to_analyze = []

    for code in key_codes:
        indicator = db.query(Indicator).filter(Indicator.code == code).first()
        if not indicator:
            continue

        hist_data = (
            db.query(HistoricalData)
            .filter(HistoricalData.indicator_id == indicator.id, HistoricalData.country_code == "NGA")
            .order_by(HistoricalData.date.desc())
            .limit(3)
            .all()
        )

        data_to_analyze.append({
            "indicator_name": indicator.name,
            "unit": indicator.unit,
            "recent_values": [{"year": h.date, "value": h.value} for h in hist_data]
        })

    # Fallback: don't fail the UI if the required dataset is not populated yet.
    engine = AIAnalystEngine()
    report = engine.generate_report(data_to_analyze)

    return {
        "success": True,
        "report": report,
        "data_available": bool(data_to_analyze),
    }
