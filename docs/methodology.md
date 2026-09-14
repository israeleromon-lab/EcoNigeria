# Methodology — EconoNigeria 2.0

EconoNigeria's mission is to provide transparent, reproducible economic intelligence. This document outlines how our derived metrics, forecasts, and AI systems function under the hood.

## 1. Data Processing and Ingestion

We rely heavily on official data sources (e.g., CBN, NBS, World Bank). 
- **Validation:** When data is ingested, our ETL pipeline runs checks for missing values, unexpected jumps (outliers), and schema changes. If data fails validation, the pipeline is marked as `STALE` or `WARNING` and requires manual review.
- **Normalization:** Data is mapped to standard `indicator_code` formats so it can be queried uniformly through the Open API.

## 2. Economic Signals (Upcoming)

The **Economic Signals** system automatically identifies meaningful movements in the economy. 
Signals are triggered based on statistical thresholds:
- **Accelerating/Decelerating Trends:** A 3-period moving average slope calculation.
- **Standard Deviation Breaches:** When an indicator moves beyond 2 standard deviations from its 12-month rolling mean.
- **Threshold Crossing:** e.g., Inflation crossing 30%, or FX breaching a specific resistance level.

*Note: Signals clearly separate observed facts from interpretation.*

## 3. Economic Pulse (Upcoming)

The **EconoNigeria Economic Pulse** is an analytical composite score designed to gauge the overall health and direction of the macroeconomy. **It is not an official government statistic.**

**Component Inputs:**
- Inflation Rate (Inverted weight)
- FX Stability (Volatility index)
- GDP Growth (Positive weight)
- Unemployment (Inverted weight)
- External Reserves (Positive weight)

**Calculation Methodology:**
Each component is normalized using z-scores relative to its 5-year historical average, weighted according to its macroeconomic significance for Nigeria, and aggregated into a single 0-100 score. 

## 4. Forecasting

EconoNigeria provides a **Forecast Lab** using three main models:
1. **Prophet:** Excellent for capturing strong seasonality and trend changes (e.g., historical inflation).
2. **ARIMA:** A robust classical statistical model for stationary time series.
3. **XGBoost:** Used for multivariate forecasting where feature engineering (e.g., linking oil prices to FX) adds predictive value.

**Evaluation:** 
Models are evaluated using Walk-Forward Validation. We publish the RMSE (Root Mean Squared Error) and MAPE (Mean Absolute Percentage Error) for every forecast. 
*Disclaimer: Forecasts are estimates, not guarantees.*

## 5. AI Economic Analyst

The AI Economic Analyst is **not** a generic chatbot. It is strictly grounded in the EconoNigeria Data Layer.

**How it works:**
1. A user asks a question (e.g., "Why did inflation rise in Q1?").
2. The backend retrieves the specific historical data points, recently triggered Economic Signals, and the latest Forecast metrics from the PostgreSQL database.
3. The raw data and context are passed as a strict system prompt to the LLM (Gemini).
4. The LLM generates an executive summary, citing specific data points provided in the prompt.

**Rule:** The AI is instructed *never* to fabricate statistics or rely on external hallucinated numbers.
