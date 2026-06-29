# Architecture — EconoNigeria

## System Overview

EconoNigeria is a three-tier web application with a React frontend, Python backend, and PostgreSQL database, augmented by ML forecasting models and AI-powered analysis.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              Next.js 15 (App Router)                        │
│         TailwindCSS + Shadcn UI + Recharts                  │
│              Deployed on Vercel                             │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                   FastAPI (Python)                           │
│            SQLAlchemy + Pydantic                             │
│              Deployed on Railway                            │
├──────────┬──────────┬──────────┬────────────┬───────────────┤
│ REST API │   ETL    │ Forecast │ AI Service │    Report     │
│ Routers  │ Pipelines│  Engine  │  (Gemini)  │  Generator    │
└──────────┴────┬─────┴─────┬────┴─────┬──────┴───────────────┘
                │           │          │
    ┌───────────▼───────────▼──────────▼──────────┐
    │              DATA LAYER                      │
    │     PostgreSQL (Supabase)                    │
    │     Tables: indicators, historical_data,     │
    │     forecasts, model_metrics, ...            │
    └──────────────────────────────────────────────┘
         ▲              ▲              ▲
         │              │              │
    ┌────┴────┐   ┌─────┴─────┐  ┌────┴────────┐
    │World    │   │  FRED     │  │Exchange     │
    │Bank API │   │  API      │  │Rate API     │
    └─────────┘   └───────────┘  └─────────────┘
```

## Component Details

### Frontend (Next.js 15)

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Server-side rendering, routing, API layer |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Shadcn UI | Pre-built accessible components |
| Recharts | Data visualization (charts) |
| TanStack Query | Server state management, caching |
| Framer Motion | Animations and transitions |
| Lucide React | Icon library |

**Key Pages:**
- `/` — Dashboard with indicator cards
- `/inflation` — Inflation deep-dive
- `/gdp-growth` — GDP growth analysis
- `/gdp-per-capita` — GDP per capita trends
- `/population` — Population demographics
- `/unemployment` — Labor market data
- `/government-debt` — Fiscal overview
- `/exchange-rate` — Currency analysis
- `/oil-prices` — Energy sector data
- `/analyst` — AI Economic Analyst (Phase 2)

### Backend (FastAPI)

| Technology | Purpose |
|---|---|
| FastAPI | High-performance REST API |
| SQLAlchemy | ORM for database operations |
| Pydantic | Data validation and serialization |
| Pandas | Data processing in ETL pipelines |
| Requests | HTTP client for external APIs |

**Key Modules:**
- `routers/` — API endpoint handlers
- `services/etl/` — Data ingestion pipelines
- `services/seed.py` — Initial database population
- `models/` — Database table definitions
- `schemas/` — Request/response models

### Database (PostgreSQL via Supabase)

**Tables:**
- `indicators` — Metadata for each economic indicator
- `historical_data` — Time-series values (year, value)
- `forecasts` — ML model predictions (Phase 2)
- `model_metrics` — RMSE, MAE, MAPE scores (Phase 2)

### Forecasting Engine (Phase 2)

| Model | Use Case |
|---|---|
| Prophet | Trend + seasonality decomposition |
| ARIMA | Classical time series modeling |
| XGBoost | Feature-engineered gradient boosting |
| PatchTST | Transformer-based (Phase 3) |

### AI Service (Phase 2)

- Powered by Google Gemini API
- Contextual economic Q&A
- Report generation
- Policy impact analysis

## Data Flow

```
1. ETL Pipeline runs (scheduled or manual trigger)
   ├── Fetch from World Bank API
   ├── Fetch from FRED API
   └── Fetch from Exchange Rate API

2. Data is validated, cleaned, and stored in PostgreSQL

3. Frontend requests data via REST API
   ├── TanStack Query caches responses
   └── Recharts renders visualizations

4. (Phase 2) Forecast Engine runs predictions
   ├── Models trained on historical data
   ├── Predictions stored in forecasts table
   └── Frontend overlays forecasts on charts

5. (Phase 2) AI Analyst processes user queries
   ├── Context: latest data + indicators
   ├── Gemini generates analysis
   └── Response displayed in chat UI
```

## Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway    │     │   Supabase   │
│  (Frontend)  │────▶│  (Backend)   │────▶│ (PostgreSQL) │
│  Next.js 15  │     │   FastAPI    │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Security

- Environment variables for all secrets (never committed)
- CORS restricted to frontend origin
- Supabase Row Level Security (RLS) for database
- Clerk authentication for user management (Phase 3)
- API rate limiting on backend endpoints
