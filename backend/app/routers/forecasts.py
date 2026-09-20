from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Indicator, HistoricalData
from app.services.forecast import ForecastingEngine

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])


@router.get("/{indicator_code}")
def get_forecast(
    indicator_code: str, 
    periods: int = Query(default=5, ge=1, le=10),
    model: str = Query(default="ensemble", regex="^(ensemble|prophet|arima)$"),
    shock_pct: float = Query(default=0.0, ge=-50.0, le=50.0),
    db: Session = Depends(get_db)
):
    """Generate predictive time-series forecasts with backtested evaluation

    and optional macro shock simulation.
    """
    # 1. Check if indicator exists
    indicator = db.query(Indicator).filter(Indicator.code == indicator_code).first()
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicator not found")

    # 2. Fetch historical data for NGA.
    hist_data = (
        db.query(HistoricalData)
        .filter(
            HistoricalData.indicator_id == indicator.id,
            HistoricalData.country_code == "NGA",
            HistoricalData.value.isnot(None),
        )
        .order_by(HistoricalData.period.asc())
        .all()
    )

    if not hist_data:
        raise HTTPException(status_code=404, detail="No historical data found for this indicator")

    # 3. Format dictionary records with period and value
    data_dicts = [
        {"period": str(row.period), "value": row.value}
        for row in hist_data
        if row.period and row.value is not None
    ]

    if not data_dicts or len(data_dicts) < 5:
        raise HTTPException(status_code=400, detail="Insufficient historical data (minimum 5 observations required)")

    # 4. Generate multi-model forecast with backtesting and scenario shocks
    engine = ForecastingEngine(data_dicts)
    result = engine.generate_forecast(
        periods=periods, 
        model_choice=model, 
        shock_pct=shock_pct
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "indicator_code": indicator.code,
        "indicator_name": indicator.name,
        "unit": indicator.unit,
        "model_requested": model,
        "periods_forecasted": periods,
        "shock_applied_pct": shock_pct,
        "data": result,
    }
