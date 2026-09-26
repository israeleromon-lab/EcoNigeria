# Methodology — EconoNigeria 2.0

EconoNigeria's mission is to provide transparent, reproducible economic intelligence. This document outlines how our data sources, ETL pipelines, derived metrics, forecasts, and AI systems function under the hood.

## 1. Data Sources & Provenance

We prioritize verified, open-access institutional APIs, and clearly flag any series supplemented with consolidated proxy datasets or academic/multilateral estimates where institutional data has historical gaps.

### Primary Data Providers & Intermediary Feeds
- **World Bank Open Data (WDI API):** Primary source for long-horizon annual demographic and macroeconomic series including Total Population (`SP.POP.TOTL`), GDP Per Capita (`NY.GDP.PCAP.CD`), Foreign Direct Investment (`BX.KLT.DINV.CD.WD`), and Central Government Debt (`GC.DOD.TOTL.GD.ZS`).
- **Central Bank of Nigeria (CBN) & FMDQ Intermediary Chain:**
  - **Monetary Policy & External Reserves:** Sourced from the CBN Statistical Portal (`https://www.cbn.gov.ng/rates/mnymktind.asp`) and CBN Statistical Bulletins, providing Monetary Policy Rate (MPR) benchmarks and Gross External Reserves (`FI.RES.TOTL.CD`, supplemented by World Bank international reserves archives for pre-2015 history).
  - **Foreign Exchange Rate (`NGN_USD` — NAFEM):** Official Nigerian Autonomous Foreign Exchange Market (NAFEM) closing rates are published by **FMDQ Securities Exchange** (`FMDQ · CBN`) and ingested programmatically via the **ExchangeRate-API (`https://v6.exchangerate-api.com/v6`)** intermediary feed alongside CBN official reference rates (`backend/app/services/etl/cbn_adapter.py`).
- **Federal Reserve Economic Data (FRED):** Maintained by the Federal Reserve Bank of St. Louis (`https://api.stlouisfed.org/fred`). Supplies global external benchmarks impacting Nigeria's fiscal and monetary conditions: Europe Brent Crude Oil Spot Price (`DCOILBRENTEU`, EIA/ICE) and the US Effective Federal Funds Rate (`FEDFUNDS`).
- **National Bureau of Statistics (NBS):** Official domestic source (`https://nigerianstat.gov.ng`) for Headline Consumer Price Index (CPI) Inflation (`FP.CPI.TOTL.ZG`), Quarterly Real GDP Growth (`NY.GDP.MKTP.KD.ZG`), Labor Force statistics (`SL.UEM.TOTL.ZS`), and household poverty surveys (`SI.POV.NAHC`), supplemented with consolidated proxy datasets where historical API endpoints have gaps.

### Supplementing Survey Gaps: Poverty Rate (`SI.POV.NAHC`) Citations
Because official national household living-standard surveys in Nigeria are conducted infrequently, inter-survey gaps in `SI.POV.NAHC` (2015–2025) are supplemented using verifiable institutional and academic estimates rather than synthetic interpolation:
1. **National Bureau of Statistics (NBS):** *Nigeria Living Standards Survey (NLSS 2018/2019)* (40.1% national headcount baseline) and *Nigeria Multidimensional Poverty Index (MPI 2022)* ([nigerianstat.gov.ng](https://nigerianstat.gov.ng)).
2. **World Bank Poverty & Equity Global Practice:** *Nigeria Poverty Assessment (2022): "A Better Future for All Nigerians"* and *Macro Poverty Outlook (MPO) for Sub-Saharan Africa / Nigeria (2023–2025)* ([World Bank Nigeria Poverty Assessment](https://www.worldbank.org/en/country/nigeria/publication/afw-nigeria-poverty-assessment) · [World Bank PIP](https://pip.worldbank.org)).
3. **Oxford Poverty and Human Development Initiative (OPHI):** *Global Multidimensional Poverty Index Country Briefing: Nigeria* ([ophi.org.uk](https://ophi.org.uk)).

---

## 2. ETL Processing & Dual Representation of High-Frequency Data

### Validation & Normalization
- **Validation:** When data is ingested, our ETL pipeline checks for missing values, unexpected jumps (outliers), and schema changes. Missing values are preserved as `NULL` rather than zero-filled. If a source exceeds its native publication window, the indicator is flagged as `STALE`.
- **Normalization:** Series are mapped to canonical `indicator_code` and slug identifiers so they can be queried uniformly through the `/v1` Open REST API.

### Dual Representation of Brent Crude (`DCOILBRENTEU`) & FX (`NGN_USD`)
To serve both real-time market monitoring and long-horizon econometric modeling without contradiction, EconoNigeria maintains two distinct representations for high-frequency series such as Brent Crude (`DCOILBRENTEU`):
1. **Live / Near-Real-Time Operational Ticker Display (`LIVE`):** The top operational wire (`MacroTickerTape`) displays a near-real-time market spot feed (`ICE · FRED · LIVE` for Brent Crude and `FMDQ · CBN · 10m` for NGN/USD) for current-value situational awareness.
2. **Annual-Averaged Analytical & Forecasting Series:** Within the PostgreSQL historical database (`backend/app/services/etl/fred.py`) and the **Forecast Lab**, daily Brent Crude prices and monthly interest rates are algorithmically aggregated into **annual averages** so their temporal resolution aligns with annual macroeconomic indicators (GDP, Inflation, Debt, FDI) for historical charts and Prophet/ARIMA model training.

---

## 3. Economic Signals

The **Economic Signals** system (`/api/signals` and `/v1/signals`) automatically identifies meaningful movements in the economy based on statistical thresholds:
- **Accelerating/Decelerating Trends:** Multi-period moving average slope and directional momentum calculations.
- **Standard Deviation & Regime Breaches:** Triggered when an indicator moves beyond historical volatility bands or crosses critical macroeconomic thresholds (e.g., CPI Inflation exceeding 30% or External Reserves buffer shifts).

*Note: Signals clearly separate observed empirical facts from analytical interpretation.*

---

## 4. Economic Pulse

The **EconoNigeria Economic Pulse** (`/v1/pulse`) is an analytical composite score (0–100) designed to gauge the overall health and direction of the macroeconomy. **It is not an official government statistic.**

**Component Inputs:**
- Inflation Rate (`FP.CPI.TOTL.ZG` — inverted weight)
- Real GDP Growth (`NY.GDP.MKTP.KD.ZG` — positive weight)
- Brent Crude Oil Price (`DCOILBRENTEU` — fiscal/external buffer weight)
- Government Debt to GDP (`GC.DOD.TOTL.GD.ZS` — inverted leverage weight)
- Unemployment Rate (`SL.UEM.TOTL.ZS` — inverted weight)

**Calculation Methodology:**
Each component is evaluated against structural macroeconomic thresholds for Nigeria and aggregated around a neutral baseline into a bounded 0–100 score (`Resilient`, `Moderate`, `Strained`, or `Vulnerable`), accompanied by explicit positive (`support`) and negative (`drag`) driver attributions.

---

## 5. Forecasting Engine

EconoNigeria provides an interactive **Forecast Lab** (`/forecasts` and `/v1/forecasts/{slug}`) built on statistical time-series models:
1. **Meta Prophet:** Additive decomposition capturing non-linear trend changepoints and structural shifts, outputting 80% Bayesian credible intervals.
2. **ARIMA (1,1,1):** Classical Box-Jenkins autoregressive integrated moving average model for short-to-medium-term persistence.
3. **Ensemble Hybrid (Default):** Equal-weighted blend of Prophet and ARIMA projections to reduce single-model variance across emerging-market structural breaks. *(Multivariate XGBoost cross-indicator modeling is planned for a future release).*

**Evaluation:**
Models are evaluated using out-of-sample holdout backtesting (`backend/app/services/forecast.py`), holding out trailing observations to compute and publish **RMSE** (Root Mean Squared Error) and **MAPE** (Mean Absolute Percentage Error) alongside every forecast.
*Disclaimer: Forecasts and scenario shock simulations are statistical estimates, not guarantees.*

---

## 6. AI Economic Analyst

The **AI Economic Analyst** (`/api/analyst/report` and `/research`) is **not** a generic chatbot. It is strictly grounded in the EconoNigeria Data Layer:
1. The backend retrieves validated historical observations, active Economic Signals, and the current Economic Pulse score from PostgreSQL.
2. These verified figures are injected into a strict grounding prompt sent to the LLM (Gemini / OpenRouter).
3. The LLM synthesizes executive summaries and policy briefs citing only the empirical figures provided in the context window.
