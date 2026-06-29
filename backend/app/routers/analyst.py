from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.ai_analyst import AIAnalystEngine

router = APIRouter(prefix="/api/analyst", tags=["ai_analyst"])

@router.get("/report")
def get_ai_report(db: Session = Depends(get_db)):
    # 1. Fetch latest data for a few key indicators (e.g. GDP, Inflation, Population)
    key_codes = ["NY.GDP.PCAP.CD", "FP.CPI.TOTL.ZG", "SP.POP.TOTL", "SL.UEM.TOTL.ZS"]
    
    indicators = db.query(Indicator).filter(Indicator.code.in_(key_codes)).all()
    indicator_map = {i.id: i for i in indicators}
    
    if not indicator_map:
        raise HTTPException(status_code=404, detail="Key indicators not found")
        
    data_to_analyze = []
    
    for ind_id, ind in indicator_map.items():
        # Get the last 3 years of data for this indicator
        hist_data = (
            db.query(HistoricalData)
            .filter(HistoricalData.indicator_id == ind.id, HistoricalData.country_code == "NGA")
            .order_by(HistoricalData.date.desc())
            .limit(3)
            .all()
        )
        
        # Format for AI
        data_to_analyze.append({
            "indicator_name": ind.name,
            "unit": ind.unit,
            "recent_values": [{"year": h.date, "value": h.value} for h in hist_data]
        })
        
    # 2. Call AI Engine
    engine = AIAnalystEngine()
    report = engine.generate_report(data_to_analyze)
    
    return {
        "success": True,
        "report": report
    }
