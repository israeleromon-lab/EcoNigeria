<div align="center">

# 🇳🇬 EconoNigeria

### The open intelligence layer for Nigeria's economy.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**Explore economic data, understand what changed, analyze the drivers, and forecast what may come next.**

[Live Platform](https://eco-nigeria-gules.vercel.app/) · [API Docs](docs/) · [Documentation](docs/) · [GitHub](https://github.com/israeleromon-lab/EcoNigeria)

</div>

---

## 📋 Vision

**EconoNigeria 2.0** is an open-source economic intelligence infrastructure for Nigeria and, eventually, Africa. 

The core principle driving this project is:
**DATA → ANALYSIS → FORECAST → INTELLIGENCE → DECISION**

We believe that high-quality macroeconomic data and intelligence should not be locked behind $24,000/year terminal paywalls. EconoNigeria democratizes this data, providing researchers, developers, students, and citizens with the infrastructure to understand the economy clearly and transparently.

> **Open-Source Principle:** EconoNigeria is strictly open source and non-monetized. Core data and APIs are completely free. We optimize for public impact, data transparency, reproducibility, and developer ecosystem growth—not revenue.

---

## ✨ Core Product Areas

### 1. EconoNigeria Explore (Live)
Public economic dashboard covering Inflation, Real GDP Growth, Unemployment, Public Debt, Exchange Rate (NAFEM), Gross External Reserves, Brent Crude, Poverty Rate, Foreign Direct Investment, and more.
- View current values, 15-observation sparklines, historical charts, native data frequency, and data provenance.

### 2. Economic Data Layer (Live — Expanding)
Automated ingestion engine (`World Bank WDI`, `FRED`, `CBN`, `NBS`, `FMDQ / ExchangeRate-API`) that validates and standardizes disparate economic series into a single PostgreSQL (`Neon.tech`) database with provenance metadata and pipeline health monitoring at `/status`.

### 3. Open API & Developer Portal (Live)
Public, un-paywalled REST endpoints under `/v1` (`/v1/indicators`, `/v1/pulse`, `/v1/forecasts`, `/v1/events`, `/v1/signals`, `/v1/compare`) with interactive documentation and cURL/Python/JavaScript quickstarts at `/developers`.

### 4. Forecast Lab (Live — Beta)
Interactive multi-model predictive laboratory at `/forecasts` (Meta Prophet, Box-Jenkins ARIMA, and Hybrid Ensemble) with 80% Bayesian confidence bands, out-of-sample holdout backtesting metrics (`RMSE`, `MAPE`), Model Cards, and an interactive Scenario Shock Simulator. *(Multivariate XGBoost and sub-annual horizons in progress).*

### 5. AI Economic Analyst & Research Hub (Live)
An AI synthesis layer grounded strictly in validated PostgreSQL database series, active Economic Signals, and the composite Economic Pulse—providing executive summaries on the dashboard and exportable policy briefs at `/research`.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A["Data Sources: CBN, NBS, FMDQ, FRED, World Bank"] --> B["Ingestion and Validation Pipeline"]
    B --> C["PostgreSQL Database - Neon.tech"]
    C --> D["Open REST API - v1"]
    D --> E["Explore Dashboard"]
    D --> F["Forecast Lab - Prophet and ARIMA"]
    C --> G["Grounded AI Economic Analyst"]
```

EconoNigeria separates high-frequency market monitoring from low-frequency analytical workloads. Data is updated according to its **native frequency** (e.g., FX and Brent spot feeds on the operational ticker vs. annual/quarterly national accounts), ensuring we never fabricate minute-by-minute updates for slow-moving macroeconomic indicators.

See [docs/architecture.md](docs/architecture.md) for full architectural details.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Shadcn UI, Recharts |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy, Pydantic, Pandas |
| **Database** | PostgreSQL (Neon.tech) |
| **AI & Models**| Gemini / OpenRouter, Prophet, ARIMA *(Live)*; XGBoost *(Planned)* |
| **Infrastructure** | Vercel (Frontend), Render (Backend), Docker |

---

## 🚀 Getting Started for Developers

### Prerequisites
- Node.js 18+
- Python 3.12+ (managed via `uv` or `pyenv`)
- PostgreSQL database

### 1. Clone & Configure
```bash
git clone https://github.com/israeleromon-lab/EcoNigeria.git
cd EcoNigeria
cp .env.example .env
# Fill in your database URL and API keys in .env
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Seed the database with initial historical data
python -m app.services.seed

# Start the API server
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

## 🤝 Community & Contribution

We are building an **Open Developer Ecosystem**. EconoNigeria relies on contributors to add new data sources, refine forecasting models, improve the frontend, and expand our research coverage.

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to get involved, from good first issues to major architectural changes.
- **[ROADMAP.md](ROADMAP.md)** - Our 6-phase master plan.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Our community guidelines.
- **[SECURITY.md](SECURITY.md)** - How to report security vulnerabilities.

---

## 🔬 Data Provenance & Reproducibility

Trust is our most important feature. Every data point on EconoNigeria tracks:
- Source organization
- Original publication date
- EconoNigeria ingestion timestamp
- Native frequency
- Methodology & Unit

Researchers must be able to exactly reproduce our findings. See [docs/methodology.md](docs/methodology.md) for details on our data standardization and forecasting strategies.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <b>Built with ❤️ for Nigeria's economic future.</b>
</div>
