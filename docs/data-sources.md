# Data Sources — EconoNigeria 2.0

## Overview

EconoNigeria aggregates macroeconomic data from verified institutional APIs and official domestic statistical agencies. Where official APIs have historical or inter-survey gaps, series are supplemented with documented proxy datasets or peer-reviewed multilateral/academic estimates and clearly flagged with provenance metadata.

---

## Provenance Tracking Schema

To guarantee transparency and reproducibility, every data point tracked by EconoNigeria stores detailed provenance metadata in PostgreSQL (`Neon.tech`):

- `source_checked_time`: The exact timestamp when our ingestion engine last pinged the source.
- `observation_time`: The specific period the data point represents (e.g., `2024`).
- `publication_time`: The timestamp when the original source officially published the data.
- `ingestion_time`: The timestamp when the data was validated and written to our database.
- `native_frequency`: The actual frequency at which the source publishes the data (`Daily`, `Monthly`, `Quarterly`, `Annual`).

---

## 1. World Bank Indicators API (WDI)

**Base URL:** `https://api.worldbank.org/v2`  
**Authentication:** None required (public API)  
**Country Code:** `NGA` (Nigeria)

### Indicators

| Indicator | Code | Native Frequency | Unit |
|---|---|---|---|
| Total Population | `SP.POP.TOTL` | Annual | People |
| GDP Per Capita | `NY.GDP.PCAP.CD` | Annual | Current USD |
| Inflation Rate (CPI) | `FP.CPI.TOTL.ZG` | Annual / Monthly (with NBS) | Annual % |
| GDP Growth Rate | `NY.GDP.MKTP.KD.ZG` | Annual / Quarterly (with NBS) | Annual % |
| Unemployment Rate | `SL.UEM.TOTL.ZS` | Annual | % of labor force |
| Government Debt | `GC.DOD.TOTL.GD.ZS` | Annual | % of GDP |
| Foreign Direct Investment | `BX.KLT.DINV.CD.WD` | Annual | Current USD |
| Poverty Headcount Ratio | `SI.POV.NAHC` | Annual (Survey + Estimates) | % of population |

### Supplemented Survey Series (`SI.POV.NAHC`)
Because national household surveys are infrequent, inter-survey years for `SI.POV.NAHC` are supplemented using:
- **NBS:** *Nigeria Living Standards Survey (NLSS 2018/2019)* and *Multidimensional Poverty Index (MPI 2022)* (`https://nigerianstat.gov.ng`).
- **World Bank:** *Nigeria Poverty Assessment (2022)* and *Macro Poverty Outlook (MPO 2023–2025)* (`https://pip.worldbank.org`).
- **OPHI:** *Global Multidimensional Poverty Index Country Briefing: Nigeria* (`https://ophi.org.uk`).

---

## 2. FRED (Federal Reserve Economic Data)

**Base URL:** `https://api.stlouisfed.org/fred`  
**Authentication:** API Key required (`FRED_API_KEY`)

### Indicators

| Indicator | Code | Native Frequency | Unit |
|---|---|---|---|
| Brent Crude Oil Price | `DCOILBRENTEU` | Daily (Ticker) / Annual Avg (Forecasting) | USD/barrel |
| Federal Funds Rate | `FEDFUNDS` | Monthly (Ticker) / Annual Avg (Forecasting) | % |

### Dual Representation Note (Ticker vs. Forecasting Layer)
For `DCOILBRENTEU` (Brent Crude), EconoNigeria provides two distinct representations:
1. **Live / Near-Real-Time Ticker Feed (`LIVE`):** Displayed on the operational wire (`MacroTickerTape`) to reflect current spot market conditions (`ICE · FRED`).
2. **Annual-Averaged ETL Series:** In `backend/app/services/etl/fred.py`, daily observations are aggregated into annual averages so they match the annual cadence of domestic macroeconomic series used in historical trajectory charts and the Forecasting Engine (Prophet/ARIMA).

---

## 3. Central Bank of Nigeria (CBN) & FMDQ Intermediary Feeds

**Primary Endpoints & Intermediaries:**
- **CBN Statistical Portal:** `https://www.cbn.gov.ng/rates/mnymktind.asp` (`backend/app/services/etl/cbn_adapter.py`)
- **FMDQ / ExchangeRate-API Intermediary:** `https://v6.exchangerate-api.com/v6` (`backend/app/services/etl/exchange_rate.py`)

### Indicators

| Indicator | Code | Provenance Chain | Native Frequency | Unit |
|---|---|---|---|---|
| Exchange Rate (NGN/USD) | `NGN_USD` | FMDQ NAFEM · CBN → ExchangeRate-API | Daily / Near Real-Time | NGN per 1 USD |
| Gross External Reserves | `FI.RES.TOTL.CD` | CBN Statistical Bulletin · World Bank WDI | Monthly | USD |

### Ingestion Strategy
Official Nigerian Autonomous Foreign Exchange Market (NAFEM) rates are published by **FMDQ Securities Exchange** under CBN regulatory oversight and ingested programmatically via **ExchangeRate-API** alongside CBN adapter reference checks (`cbn_adapter.py`). Gross External Reserves (`FI.RES.TOTL.CD`) combine CBN statistical releases with World Bank international reserves series (`FI.RES.TOTL.CD`).

---

## 4. National Bureau of Statistics (NBS)

**Portal URL:** `https://nigerianstat.gov.ng` (`backend/app/services/etl/nbs_adapter.py`)

### Indicators

| Indicator | Code | Native Frequency | Unit |
|---|---|---|---|
| Headline CPI Inflation | `FP.CPI.TOTL.ZG` | Monthly / Annual | % |
| Real GDP Growth Rate | `NY.GDP.MKTP.KD.ZG` | Quarterly / Annual | % |

### Ingestion Strategy
`NBSAdapter` monitors the NBS statistical portal and supplements World Bank annual series with latest official NBS headline CPI and quarterly Real GDP releases, falling back to verified NBS statistical bulletin benchmarks when the upstream portal times out.

---

## Data Quality & Validation

- **Missing Values:** Handled transparently; gaps are preserved as `NULL` and never zero-filled.
- **Staleness Detection:** Automatically flags any indicator whose latest observation period exceeds the threshold for its `native_frequency`.
- **Revision Detection:** Upserts on `(indicator_id, country_code, period)` ensure historical revisions from upstream sources update existing records cleanly.
