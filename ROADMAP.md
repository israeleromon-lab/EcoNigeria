# EconoNigeria Master Roadmap

> **Last verified:** 2026-09-26  
> **Status Legend:** `[x]` Live & verified · `[~]` In progress / partially implemented · `[ ]` Planned

EconoNigeria 2.0 is evolving from a visualization dashboard into an **Open Economic Intelligence Infrastructure** for Nigeria (and eventually Africa).

Below is our 6-phase master plan reflecting the verified state of the live platform (`eco-nigeria-gules.vercel.app`) and public REST API (`/v1`). We welcome community contributions across all phases!

## PHASE A — REPOSITIONING (Complete)
Goal: Establish the open-source foundation, governance, and architecture.
- [x] Rewrite README to reflect open-source infrastructure vision
- [x] Create open-source governance files (`CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`)
- [x] Fix naming and infrastructure documentation inconsistencies (Render + Neon PostgreSQL)
- [x] Improve landing page messaging and editorial terminal layout

## PHASE B — DATA INFRASTRUCTURE (In Progress)
Goal: Build a robust, transparent, near-real-time data layer.
- [~] Implement robust source adapters for CBN, NBS, and World Bank *(World Bank WDI, FRED, and ExchangeRate-API ETL pipelines are live; CBN and NBS adapters currently perform portal health checks with verified statistical benchmark fallbacks while full automated bulletin scrapers are in progress)*
- [~] Establish one-minute source monitoring for eligible high-frequency data *(ETL runs automatically on backend startup and via manual `/api/admin/run-etl` trigger; dedicated 1-minute background cron scheduler is pending)*
- [x] Implement data freshness and provenance tracking metadata (`observation_time`, `publication_time`, `ingestion_time`, `source_checked_time`, `native_frequency`)
- [x] Build a public Data Status page monitoring pipeline health (`/status` and `/api/status`)
- [~] Establish versioned datasets for reproducibility *(`/v1/datasets` serves release metadata, BibTeX citations, and SHA-256 checksums; immutable per-release archival snapshots are in progress)*

## PHASE C — INTELLIGENCE (Live — Expanding)
Goal: Provide data-grounded insights and analytical tools.
- [x] Economic Signals: Automated alerts for meaningful market movements (`/api/signals` and `/v1/signals`)
- [x] Economic Pulse: A composite analytical score tracking macroeconomic health (`/v1/pulse` and homepage anchor card)
- [x] Data-grounded AI Analyst: Connecting LLM synthesis strictly to validated database series (`/api/analyst/report`)
- [~] Event Timeline: Overlay historical events against data *(Curated 2005–2024 policy and shock timeline is live on indicator detail pages and `/v1/events`; automated event ingestion is planned)*
- [x] Research Hub: Platform for generating, archiving, and exporting data-backed policy briefs (`/research`)

## PHASE D — FORECASTING (Live — Beta)
Goal: Provide transparent predictive models for policymakers and researchers.
- [~] Forecast Lab: Interactive UI for testing horizons *(Live at `/forecasts` for 1, 3, 5, and 8-year annual horizons; sub-annual 3, 6, and 12-month horizons pending monthly time-series ingestion)*
- [x] Implement ARIMA and Prophet with Ensemble hybrid model (`/api/forecasts/{code}` and `/v1/forecasts/{slug}`)
- [x] Formalize model evaluation (Out-of-sample holdout backtesting with RMSE, MAPE, and accuracy grading)
- [~] Scenario Simulator: Test theoretical macro shocks *(Interactive `-30%` to `+30%` shock slider and macro presets are live on `/forecasts`; multivariate cross-indicator shock propagation via XGBoost is planned)*
- [~] Publish "Model Cards" documenting training methodologies *(Dynamic model card assumptions, caveats, and training windows are returned by the forecast API and rendered on `/forecasts`; standalone per-series documentation cards are planned)*

## PHASE E — OPEN DEVELOPER ECOSYSTEM (In Progress)
Goal: Allow third parties to build upon EconoNigeria without paywalls.
- [x] Publish the Open REST API (`/v1/indicators`, `/v1/pulse`, `/v1/forecasts`, `/v1/events`, `/v1/signals`)
- [x] Write comprehensive API documentation (Interactive Developer Portal at `/developers` and OpenAPI Swagger UI at `/docs`)
- [~] Release Python and JavaScript SDK/Examples *(Working cURL, Python, and JavaScript quickstart code examples are live on `/developers`; standalone installable PyPI and npm SDK packages are not yet published)*
- [ ] Build a plugin architecture for external data sources *(`BaseAdapter` interface exists in `backend/app/services/etl/base.py`; third-party plugin registry and loader are planned)*
- [~] Publish reproducible Jupyter notebooks *(Initial quickstart notebook `notebooks/01_macro_intelligence_quickstart.ipynb` is published; expanded indicator and backtesting notebooks are in progress)*

## PHASE F — SCALE TO AFRICA (Prototype / In Progress)
Goal: Expand the open intelligence infrastructure across the continent.
- [~] Expand ingestion architecture to Ghana, Kenya, South Africa, Egypt, Rwanda, and Côte d'Ivoire *(Harmonized 2018–2024 World Bank / IMF WEO benchmark snapshots are available in `backend/app/services/comparison.py`, but automated multi-country database ETL ingestion is not yet implemented)*
- [~] Enable cross-country comparisons (`/v1/compare/{country_a}/{country_b}` and `/compare` UI are live using harmonized benchmark snapshots; live database-backed multi-country time-series comparison is planned)
