<div align="center">

# 🇳🇬 EconoNigeria

### AI-Powered Economic Intelligence Platform for Nigeria

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**Democratizing economic intelligence for 230 million Nigerians**

[Live Demo](https://eco-nigeria-gules.vercel.app/) · [API Docs](#) · [Documentation](docs/) · [Screenshots](#screenshots)

</div>

---

## 📋 Problem

Nigeria — Africa's largest economy — lacks an accessible, centralized platform for economic intelligence. Existing tools are:
- **Fragmented**: Data scattered across World Bank, CBN, NBS, and FRED
- **Expensive**: Bloomberg Terminal costs $24,000/year
- **Inaccessible**: Raw data requires technical expertise to analyze
- **Static**: No forecasting or AI-powered analysis

## 💡 Why It Matters

- **230M+ citizens** affected by economic policy decisions
- **Students & researchers** need accessible data for academic work
- **SMEs & investors** need affordable market intelligence
- **Policymakers** need evidence-based forecasting tools

## 🚀 Solution

**EconoNigeria** is a free, open-source platform that:
1. **Aggregates** macroeconomic data from multiple authoritative sources
2. **Visualizes** trends with interactive, publication-quality charts
3. **Forecasts** key indicators using ML models (Prophet, ARIMA, XGBoost)
4. **Analyzes** economic events with AI-powered explanations (Gemini)
5. **Exports** data and reports for research and decision-making

---

## ✨ Features

### 📊 Economic Dashboard
Real-time overview of 8+ key indicators with trend sparklines, percentage changes, and at-a-glance statistics.

### 📈 Deep-Dive Indicator Pages
Individual analysis pages for Inflation, GDP Growth, GDP Per Capita, Population, Unemployment, Government Debt, Exchange Rate, and Oil Prices — each with historical charts, data tables, and CSV export.

### 🤖 AI Economic Analyst (Phase 2)
Ask questions like "Why is inflation rising?" or "Predict the impact of fuel subsidy removal" and get AI-powered analysis backed by real data.

### 📉 Forecast Engine (Phase 2)
ML-powered predictions for 3, 6, and 12-month horizons using Prophet, ARIMA, and XGBoost with transparent accuracy metrics (RMSE, MAE, MAPE).

### 📄 Report Generator (Phase 2)
Automated weekly, monthly, quarterly, and annual economic reports exportable as PDF and CSV.

### 🔬 Research Hub (Phase 3)
Curated collection of research papers, articles, and economic briefs with search, categories, and tags.

---

## 🏗️ Architecture

```
Frontend (Next.js 15)  ──REST──▶  Backend (FastAPI)  ──SQL──▶  PostgreSQL (Supabase)
       │                              │
  TailwindCSS                    ETL Pipelines
  Shadcn UI                     ┌────┴────┐
  Recharts                      │ World   │
  TanStack Query                │ Bank    │
  Framer Motion                 │ FRED    │
                                │ ExRate  │
                                └─────────┘
```

See [docs/architecture.md](docs/architecture.md) for the full architecture diagram.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Shadcn UI, Recharts, TanStack Query, Framer Motion |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, Pandas |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Clerk (Phase 3) |
| **AI** | Google Gemini API (Phase 2) |
| **Forecasting** | Prophet, ARIMA, XGBoost (Phase 2) |
| **Deployment** | Vercel (Frontend), Railway (Backend), Docker |

---

## 📊 Economic Indicators

| Indicator | Source | Code |
|---|---|---|
| Total Population | World Bank | `SP.POP.TOTL` |
| GDP Per Capita (USD) | World Bank | `NY.GDP.PCAP.CD` |
| Inflation Rate (CPI %) | World Bank | `FP.CPI.TOTL.ZG` |
| GDP Growth Rate (%) | World Bank | `NY.GDP.MKTP.KD.ZG` |
| Unemployment Rate (%) | World Bank | `SL.UEM.TOTL.ZS` |
| Government Debt (% GDP) | World Bank | `GC.DOD.TOTL.GD.ZS` |
| Foreign Direct Investment | World Bank | `BX.KLT.DINV.CD.WD` |
| Brent Oil Price (USD) | FRED | `DCOILBRENTEU` |
| Federal Funds Rate (%) | FRED | `FEDFUNDS` |
| Exchange Rate (NGN/USD) | ExchangeRate API | Custom |

See [docs/data-sources.md](docs/data-sources.md) for full API documentation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Supabase account)

### 1. Clone & Configure
```bash
git clone https://github.com/yourusername/econonigeria.git
cd econonigeria
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Seed the database
python -m app.services.seed

# Run ETL pipelines
python -m app.services.etl.runner

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
econonigeria/
├── frontend/          # Next.js 15 application
├── backend/           # FastAPI REST API
├── forecasting/       # ML forecasting models (Phase 2)
├── datasets/
│   ├── raw/           # Raw data from APIs
│   ├── processed/     # Cleaned datasets
│   ├── forecasts/     # Model predictions
│   └── exports/       # User exports
├── docs/              # Documentation
├── notebooks/         # Jupyter analysis notebooks
├── reports/           # Generated reports
├── docker/            # Docker configs
├── deployment/        # Deploy scripts
└── README.md
```

---

## 🌍 Economic Impact

EconoNigeria democratizes access to economic intelligence by providing:

- **Free access** to data that costs thousands of dollars elsewhere
- **AI-powered analysis** that makes complex economics understandable
- **Forecasting tools** that empower evidence-based decision making
- **Export capabilities** that support academic research
- **Open-source codebase** that can be adapted for other African economies

---

## 🔬 Methodology

### Data Collection
- Automated ETL pipelines fetch data from World Bank, FRED, and Exchange Rate APIs
- Data is validated for completeness, outliers, and consistency
- Historical data spans 1960–present (where available)

### Forecasting Models (Phase 2)
- **Prophet**: Facebook's time series model for trend + seasonality decomposition
- **ARIMA**: Classical statistical model for stationary series
- **XGBoost**: Gradient-boosted trees with engineered features
- **PatchTST**: Transformer-based model for long-horizon predictions (Phase 3)

### Model Evaluation
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- MAPE (Mean Absolute Percentage Error)
- Walk-forward validation with 80/20 train/test split

---

## 📸 Screenshots

*Coming soon — see `screenshots/` directory*


![EconoNigeria Dashboard 1](reports/1%20(1).jpeg)

![EconoNigeria Dashboard 2](reports/1%20(2).jpeg)

![EconoNigeria Dashboard 3](reports/1%20(3).jpeg)

---

## 🗺️ Future Work

- [ ] PatchTST transformer model for long-range forecasting
- [ ] Natural language report generation with Gemini
- [ ] Comparison with peer economies (Ghana, Kenya, South Africa)
- [ ] CBN (Central Bank of Nigeria) data integration
- [ ] Real-time news sentiment analysis
- [ ] Mobile application (React Native)
- [ ] Multi-language support (Yoruba, Hausa, Igbo)
- [ ] API marketplace for third-party developers

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for Nigeria's economic future**

*EconoNigeria — Making economic intelligence accessible to all*

</div>
