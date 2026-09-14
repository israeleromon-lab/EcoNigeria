# Data Sources — EconoNigeria 2.0

## Overview

EconoNigeria aggregates macroeconomic data from multiple primary sources. Under EconoNigeria 2.0, our data infrastructure uses a near-real-time monitoring architecture to detect new data immediately without fabricating data points between official releases.

---

## Provenance Tracking Schema

To guarantee transparency and reproducibility, every data point tracked by EconoNigeria stores detailed provenance metadata:

- `source_checked_time`: The exact timestamp when our ingestion engine last pinged the source.
- `observation_time`: The specific period the data point represents (e.g., January 2026).
- `publication_time`: The timestamp when the original source officially published the data.
- `ingestion_time`: The timestamp when the data was validated and successfully written to our database.
- `native_frequency`: The actual frequency at which the source publishes the data (e.g., Monthly, Quarterly, Daily).

---

## 1. World Bank Indicators API

**Base URL:** `https://api.worldbank.org/v2`  
**Authentication:** None required (public API)  
**Country Code:** `NGA` (Nigeria)

### Indicators

| Indicator | Code | Native Frequency | Unit |
|---|---|---|---|
| Total Population | `SP.POP.TOTL` | Annual | People |
| GDP Per Capita | `NY.GDP.PCAP.CD` | Annual | Current USD |
| Inflation Rate (CPI) | `FP.CPI.TOTL.ZG` | Annual/Monthly | Annual % |
| GDP Growth Rate | `NY.GDP.MKTP.KD.ZG` | Annual/Quarterly | Annual % |
| Unemployment Rate | `SL.UEM.TOTL.ZS` | Annual | % of labor force |
| Government Debt | `GC.DOD.TOTL.GD.ZS` | Annual | % of GDP |
| Foreign Direct Investment | `BX.KLT.DINV.CD.WD` | Annual | Current USD |

### Ingestion Strategy
Although World Bank data changes infrequently, EconoNigeria periodically polls for updates to detect historical revisions or new annual releases.

---

## 2. FRED (Federal Reserve Economic Data)

**Base URL:** `https://api.stlouisfed.org/fred`  
**Authentication:** API Key required (`FRED_API_KEY`)

### Indicators

| Indicator | Code | Native Frequency | Unit |
|---|---|---|---|
| Brent Crude Oil Price | `DCOILBRENTEU` | Daily | USD/barrel |
| Federal Funds Rate | `FEDFUNDS` | Monthly | % |

### Ingestion Strategy
Daily and monthly monitoring jobs track these endpoints to capture rapid commodity and interest rate movements.

---

## 3. Official Nigerian Sources (Upcoming)

EconoNigeria 2.0 will heavily expand into native Nigerian data sources, building direct ingestion adapters for:

- **Central Bank of Nigeria (CBN)**
- **National Bureau of Statistics (NBS)**

### Ingestion Strategy
These adapters will utilize our 1-minute monitoring job to detect new publications (like monthly inflation reports or quarterly GDP figures) the moment they are released to the public.

---

## 4. High-Frequency Market Data

For highly volatile indicators, EconoNigeria uses active, high-frequency monitoring.

### Indicators

| Indicator | Native Frequency | Unit |
|---|---|---|
| Exchange Rate (NGN/USD) | Near Real-Time (Minute/Hourly) | NGN per 1 USD |

### Ingestion Strategy
The ingestion engine pings market data endpoints (such as ExchangeRate API or market aggregators) at regular, short intervals to provide a "Live" freshness indicator on the dashboard.

---

## Data Quality & Validation

- **Missing Values:** Handled transparently; gaps are not artificially interpolated unless explicitly required by a forecasting model (in which case it is tracked).
- **Outlier Detection:** Flags values > 3 standard deviations from the 12-month mean.
- **Revision Detection:** Checks if historical values have been revised by the original source and updates our records accordingly.
