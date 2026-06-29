from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.forecast import ForecastingEngine

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])

@router.get("/{indicator_code}")
def get_forecast(indicator_code: str, periods: int = 5, db: Session = Depends(get_db)):
    # 1. Check if indicator exists
    indicator = db.query(Indicator).filter(Indicator.code == indicator_code).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicator not found")
        
    # 2. Fetch historical data for NGA
    hist_data = (
        db.query(HistoricalData)
        .filter(HistoricalData.indicator_id == indicator.id, HistoricalData.country_code == "NGA")
        .order_by(HistoricalData.date.asc())
        .all()
    )
    
    if not hist_data:
        raise HTTPException(status_code=404, detail="No historical data found for this indicator")
        
    # 3. Format data for engine
    data_dicts = [{"date": d.date, "value": d.value} for d in hist_data if d.value is not None]
    
    # 4. Generate forecast
    engine = ForecastingEngine(data_dicts)
    result = engine.generate_forecast(periods=periods)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return {
        "indicator_code": indicator.code,
        "indicator_name": indicator.name,
        "unit": indicator.unit,
        "periods_forecasted": periods,
        "data": result
    }
