from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.ai_analyst import AIAnalystEngine

router = APIRouter(prefix="/api/analyst", tags=["ai_analyst"])

@router.get("/report")
def get_ai_report(db: Session = Depends(get_db)):
    """Generate an AI analyst report from available macro data.

    The historical-data model stores its time key as ``period`` rather than
    ``date``. Missing indicators or observations are tolerated so the analyst
    can still use the AI/mock fallback while ETL is running.
    """
    key_codes = ["NY.GDP.PCAP.CD", "FP.CPI.TOTL.ZG", "SP.POP.TOTL", "SL.UEM.TOTL.ZS"]
    data_to_analyze = []

    for code in key_codes:
        indicator = db.query(Indicator).filter(Indicator.code == code).first()
        if not indicator:
            continue

        hist_data = (
            db.query(HistoricalData)
            .filter(
                HistoricalData.indicator_id == indicator.id,
                HistoricalData.country_code == "NGA",
                HistoricalData.value.isnot(None),
            )
            .order_by(HistoricalData.period.desc())
            .limit(3)
            .all()
        )

        data_to_analyze.append({
            "indicator_name": indicator.name,
            "unit": indicator.unit,
            "recent_values": [
                {"year": observation.period, "value": observation.value}
                for observation in hist_data
            ],
        })

    engine = AIAnalystEngine()
    report = engine.generate_report(data_to_analyze)

    return {
        "success": True,
        "report": report,
        "data_available": bool(data_to_analyze),
    }
