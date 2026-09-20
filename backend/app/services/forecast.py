import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import math
import warnings
import logging

# Prophet
from prophet import Prophet

# Statsmodels for ARIMA
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error

# Suppress Prophet and Statsmodels warnings
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
warnings.filterwarnings("ignore")


class ForecastingEngine:
    """Handles time-series forecasting, backtesting evaluation, and scenario simulation

    using Meta Prophet and Box-Jenkins ARIMA models.
    """

    def __init__(self, data: List[Dict[str, Any]]):
        self.df = pd.DataFrame(data)
        if not self.df.empty:
            # Normalize column name: handle both 'period' and 'date'
            if "period" not in self.df.columns and "date" in self.df.columns:
                self.df["period"] = self.df["date"].astype(str)
            elif "period" in self.df.columns:
                self.df["period"] = self.df["period"].astype(str)

            # Drop missing values and sort chronologically
            self.df = self.df.dropna(subset=["value"])
            self.df["ds"] = pd.to_datetime(self.df["period"].str[:4] + "-12-31")
            self.df["y"] = self.df["value"].astype(float)
            self.df = self.df.sort_values("ds").reset_index(drop=True)

    def _train_prophet(self, train_df: pd.DataFrame, periods: int) -> pd.DataFrame:
        """Train Prophet additive model with yearly step."""
        m = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.80,  # 80% confidence interval band
        )
        m.fit(train_df[["ds", "y"]])
        future = m.make_future_dataframe(periods=periods, freq="YE")
        forecast = m.predict(future)
        return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods)

    def _train_arima(self, train_df: pd.DataFrame, periods: int) -> pd.Series:
        """Train ARIMA(1,1,1) model with differencing."""
        series = train_df.set_index("ds")["y"]
        try:
            model = ARIMA(series, order=(1, 1, 1))
            model_fit = model.fit()
            fcst = model_fit.forecast(steps=periods)
            return fcst
        except Exception:
            # Fallback to simple ARIMA(1,0,0) if differencing errors out
            model = ARIMA(series, order=(1, 0, 0))
            model_fit = model.fit()
            return model_fit.forecast(steps=periods)

    def _run_backtest(self) -> Dict[str, Any]:
        """Perform out-of-sample backtesting on historical data

        holding out the last 3 observations to compute RMSE and MAPE.
        """
        n = len(self.df)
        if n < 8:
            return {
                "backtested": False,
                "reason": "Insufficient observations for backtesting (requires >= 8 points)",
            }

        holdout_k = min(3, n // 4)
        train_df = self.df.iloc[:-holdout_k].copy()
        test_df = self.df.iloc[-holdout_k:].copy()

        try:
            prophet_fcst = self._train_prophet(train_df, periods=holdout_k)["yhat"].values
            arima_fcst = self._train_arima(train_df, periods=holdout_k).values
            ensemble_fcst = (prophet_fcst + arima_fcst) / 2.0

            actuals = test_df["y"].values

            # Compute error metrics
            rmse = math.sqrt(mean_squared_error(actuals, ensemble_fcst))
            mape = mean_absolute_percentage_error(actuals, ensemble_fcst)

            mape_pct = round(float(mape * 100), 2)
            rmse_val = round(float(rmse), 2)

            if mape_pct <= 10.0:
                grade = "High Accuracy"
            elif mape_pct <= 22.0:
                grade = "Moderate Accuracy"
            else:
                grade = "Fair Accuracy (High Volatility)"

            return {
                "backtested": True,
                "holdout_periods": holdout_k,
                "mape_pct": mape_pct,
                "rmse": rmse_val,
                "accuracy_grade": grade,
                "models_tested": ["Prophet", "ARIMA(1,1,1)", "Ensemble"],
            }
        except Exception as e:
            return {
                "backtested": False,
                "error": str(e),
            }

    def generate_forecast(
        self, 
        periods: int = 5, 
        model_choice: str = "ensemble", 
        shock_pct: float = 0.0
    ) -> Dict[str, Any]:
        if len(self.df) < 5:
            return {"error": "Not enough data for forecasting. Minimum 5 data points required."}

        periods = max(1, min(10, int(periods)))

        # 1. Generate core model predictions
        prophet_fcst = self._train_prophet(self.df, periods=periods)
        arima_fcst = self._train_arima(self.df, periods=periods)

        # 2. Backtesting validation
        evaluation = self._run_backtest()

        # 3. Format projected timeline
        last_year = int(self.df["period"].str[:4].max())
        forecast_results = []

        for i in range(periods):
            year = last_year + i + 1
            p_val = float(prophet_fcst.iloc[i]["yhat"])
            p_lower = float(prophet_fcst.iloc[i]["yhat_lower"])
            p_upper = float(prophet_fcst.iloc[i]["yhat_upper"])
            a_val = float(arima_fcst.iloc[i])
            ens_val = (p_val + a_val) / 2.0

            # Select primary value based on user choice
            if model_choice == "prophet":
                chosen_val = p_val
            elif model_choice == "arima":
                chosen_val = a_val
            else:
                chosen_val = ens_val

            # Compute scenario simulation value if a shock is applied
            # Compounding shock effect over the horizon
            shock_factor = 1.0 + (shock_pct / 100.0) * ((i + 1) / periods)
            scenario_val = round(chosen_val * shock_factor, 2)

            forecast_results.append({
                "period": str(year),
                "prophet_value": round(p_val, 2),
                "prophet_lower": round(p_lower, 2),
                "prophet_upper": round(p_upper, 2),
                "arima_value": round(a_val, 2),
                "ensemble_value": round(ens_val, 2),
                "selected_value": round(chosen_val, 2),
                "scenario_value": scenario_val if shock_pct != 0.0 else None,
            })

        # Model Card Metadata
        model_card = {
            "title": "EconoNigeria 2.0 Multi-Model Forecast Architecture",
            "models_available": [
                {
                    "name": "Ensemble (Prophet + ARIMA)",
                    "type": "Hybrid Average",
                    "description": "Blends Prophet non-linear trend changepoints with ARIMA autoregressive dynamics to minimize single-model variance."
                },
                {
                    "name": "Meta Prophet",
                    "type": "Additive Decomposition",
                    "description": "Decomposes trend and structural changepoints. Provides 80% bayesian confidence interval bands."
                },
                {
                    "name": "ARIMA(1,1,1)",
                    "type": "Autoregressive Integrated Moving Average",
                    "description": "Standard statistical time-series benchmark modeling autocorrelation and persistence."
                }
            ],
            "training_summary": {
                "training_points": len(self.df),
                "start_period": str(self.df["period"].min()),
                "end_period": str(self.df["period"].max()),
            },
            "assumptions": "Assumes historical policy and macroeconomic structure persists unless explicitly perturbed via the scenario shock simulator.",
            "caveats": "Emerging market macro indicators have wider error bands due to external commodity exposure and foreign exchange regime shifts."
        }

        return {
            "model_used": model_choice.capitalize() if model_choice != "ensemble" else "Ensemble (Prophet + ARIMA)",
            "periods": periods,
            "shock_pct": shock_pct,
            "evaluation": evaluation,
            "model_card": model_card,
            "forecast": forecast_results,
        }
