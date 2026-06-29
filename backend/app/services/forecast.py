import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.orm import Session

# Prophet
from prophet import Prophet

# Statsmodels for ARIMA
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_percentage_error
import warnings

# Suppress Prophet and Statsmodels warnings
import logging
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
warnings.filterwarnings("ignore")

class ForecastingEngine:
    """Handles time-series forecasting using Prophet and ARIMA."""
    
    def __init__(self, data: List[Dict[str, Any]]):
        """
        data: List of dicts with 'date' and 'value'. 
        Dates should be years (e.g. 2010).
        """
        self.df = pd.DataFrame(data)
        if not self.df.empty:
            # Convert year to a proper datetime format for Prophet
            self.df['ds'] = pd.to_datetime(self.df['date'].astype(str) + '-12-31')
            self.df['y'] = self.df['value']
            self.df = self.df.sort_values('ds').reset_index(drop=True)
            
    def _train_prophet(self, train_df: pd.DataFrame, periods: int) -> pd.DataFrame:
        m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
        m.fit(train_df[['ds', 'y']])
        future = m.make_future_dataframe(periods=periods, freq='YE')
        forecast = m.predict(future)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)

    def _train_arima(self, train_df: pd.DataFrame, periods: int) -> pd.Series:
        series = train_df.set_index('ds')['y']
        model = ARIMA(series, order=(1, 1, 1))
        model_fit = model.fit()
        return model_fit.forecast(steps=periods)

    def generate_forecast(self, periods: int = 5) -> Dict[str, Any]:
        if len(self.df) < 10:
            return {"error": "Not enough data for forecasting. Minimum 10 data points required."}
            
        # We will train Prophet as the primary model and ARIMA as secondary for comparison
        # In a full setup, we'd do backtesting to pick the best model dynamically.
        
        # 1. Prophet Forecast
        prophet_fcst = self._train_prophet(self.df, periods=periods)
        
        # 2. ARIMA Forecast
        arima_fcst = self._train_arima(self.df, periods=periods)
        
        # Format results
        last_year = self.df['date'].max()
        
        forecast_results = []
        for i in range(periods):
            year = last_year + i + 1
            prophet_row = prophet_fcst.iloc[i]
            arima_val = arima_fcst.iloc[i]
            
            # Simple ensemble average for final prediction
            ensemble_val = (prophet_row['yhat'] + arima_val) / 2
            
            forecast_results.append({
                "date": int(year),
                "prophet_value": float(prophet_row['yhat']),
                "prophet_lower": float(prophet_row['yhat_lower']),
                "prophet_upper": float(prophet_row['yhat_upper']),
                "arima_value": float(arima_val),
                "ensemble_value": float(ensemble_val)
            })
            
        return {
            "model_used": "Ensemble (Prophet + ARIMA)",
            "forecast": forecast_results
        }
