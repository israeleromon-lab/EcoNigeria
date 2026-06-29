# Data Sources — EconoNigeria

## Overview

EconoNigeria aggregates macroeconomic data from three primary sources. Data is fetched via ETL pipelines, validated, cleaned, and stored in PostgreSQL (Supabase).

---

## 1. World Bank Indicators API

**Base URL:** `https://api.worldbank.org/v2`

**Authentication:** None required (public API)

**Country Code:** `NGA` (Nigeria)

**Endpoint Pattern:**
```
GET /country/NGA/indicator/{indicator_code}?format=json&per_page=1000
```

### Indicators

| Indicator | Code | Unit | Typical Range |
|---|---|---|---|
| Total Population | `SP.POP.TOTL` | People | 1960–present |
| GDP Per Capita | `NY.GDP.PCAP.CD` | Current USD | 1960–present |
| Inflation Rate (CPI) | `FP.CPI.TOTL.ZG` | Annual % | 1960–present |
| GDP Growth Rate | `NY.GDP.MKTP.KD.ZG` | Annual % | 1961–present |
| Unemployment Rate | `SL.UEM.TOTL.ZS` | % of labor force | 1991–present |
| Government Debt | `GC.DOD.TOTL.GD.ZS` | % of GDP | Limited data |
| Foreign Direct Investment | `BX.KLT.DINV.CD.WD` | Current USD | 1970–present |

### Response Format
```json
[
  {"page": 1, "pages": 1, "per_page": 1000, "total": 64},
  [
    {
      "indicator": {"id": "SP.POP.TOTL", "value": "Population, total"},
      "country": {"id": "NG", "value": "Nigeria"},
      "date": "2024",
      "value": 232679478
    }
  ]
]
```

### Rate Limits
- No strict rate limit, but recommended: max 10 requests/second
- Data refreshes: Annually (World Development Indicators)

### References
- [API Documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [Indicator API Queries](https://datahelpdesk.worldbank.org/knowledgebase/articles/898599)

---

## 2. FRED (Federal Reserve Economic Data)

**Base URL:** `https://api.stlouisfed.org/fred`

**Authentication:** API Key required (`FRED_API_KEY`)

**Endpoint:**
```
GET /series/observations?series_id={code}&api_key={key}&file_type=json
```

### Indicators

| Indicator | Code | Unit | Frequency |
|---|---|---|---|
| Brent Crude Oil Price | `DCOILBRENTEU` | USD/barrel | Daily |
| Federal Funds Rate | `FEDFUNDS` | % | Monthly |

### Response Format
```json
{
  "observations": [
    {"date": "2024-01-01", "value": "78.12"},
    {"date": "2024-01-02", "value": "77.85"}
  ]
}
```

### Notes
- DCOILBRENTEU is daily data — we aggregate to annual averages for consistency
- FEDFUNDS is monthly — we aggregate to annual averages
- API key is free: [Register here](https://fred.stlouisfed.org/docs/api/api_key.html)

### Rate Limits
- 120 requests per minute

### References
- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/fred/)

---

## 3. Exchange Rate API

**Base URL:** `https://v6.exchangerate-api.com/v6`

**Authentication:** API Key required (`EXCHANGE_RATE_API_KEY`)

**Endpoint:**
```
GET /{api_key}/latest/USD
```

### Indicators

| Indicator | Code | Unit |
|---|---|---|
| NGN/USD Exchange Rate | `NGN_USD` | NGN per 1 USD |

### Response Format
```json
{
  "result": "success",
  "conversion_rates": {
    "NGN": 1550.25,
    "EUR": 0.92,
    ...
  }
}
```

### Notes
- Only provides **latest** exchange rate (no historical data on free tier)
- Historical data requires paid plan or alternative source
- For historical NGN/USD, we may supplement with World Bank indicator `PA.NUS.FCRF`

### Rate Limits
- 1,500 requests/month on free tier

### References
- [Exchange Rate API Docs](https://www.exchangerate-api.com/docs/overview)

---

## Data Refresh Schedule

| Source | Frequency | Method |
|---|---|---|
| World Bank | Weekly (data changes annually) | ETL cron job |
| FRED | Daily (for oil prices) | ETL cron job |
| Exchange Rate | Hourly (for latest rate) | ETL cron job |

## Data Quality

- All data is validated for null values before storage
- Outlier detection flags values > 3 standard deviations from mean
- Missing years are preserved as NULL (not interpolated)
- Source metadata is stored with each data point for audit trail
