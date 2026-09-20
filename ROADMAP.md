# EconoNigeria Master Roadmap

EconoNigeria 2.0 is shifting from a simple visualization dashboard to an **Open Economic Intelligence Infrastructure** for Nigeria (and eventually Africa). 

Below is our 6-phase master plan. We welcome community contributions for all phases!

## PHASE A — REPOSITIONING (Current)
Goal: Establish the open-source foundation, governance, and architecture.
- [x] Rewrite README to reflect open-source infrastructure vision
- [x] Create open-source governance files (CONTRIBUTING, SECURITY, CODE_OF_CONDUCT)
- [x] Fix naming inconsistencies
- [x] Improve landing page messaging

## PHASE B — DATA INFRASTRUCTURE
Goal: Build a robust, transparent, near-real-time data layer.
- [ ] Implement robust source adapters for CBN, NBS, and World Bank
- [ ] Establish one-minute source monitoring for eligible high-frequency data
- [x] Implement data freshness and provenance tracking metadata
- [x] Build a public Data Status page monitoring pipeline health
- [ ] Establish versioned datasets for reproducibility

## PHASE C — INTELLIGENCE
Goal: Provide data-grounded insights and analytical tools.
- [ ] Economic Signals: Automated alerts for meaningful market movements
- [x] Economic Pulse: A composite analytical score tracking macroeconomic health
- [ ] Data-grounded AI Analyst: Connecting Gemini strictly to the validated database
- [ ] Event Timeline: Overlay historical events against data
- [ ] Research Hub: Platform for publishing data-backed economic briefs

## PHASE D — FORECASTING
Goal: Provide transparent predictive models for policymakers and researchers.
- [ ] Forecast Lab: Interactive UI for testing horizons (3, 6, 12 months)
- [ ] Implement ARIMA, XGBoost, and PatchTST alongside Prophet
- [ ] Formalize model evaluation (Backtesting, RMSE, MAPE)
- [ ] Scenario Simulator: Test theoretical macro shocks
- [ ] Publish "Model Cards" documenting training methodologies

## PHASE E — OPEN DEVELOPER ECOSYSTEM
Goal: Allow third parties to build upon EconoNigeria without paywalls.
- [ ] Publish the Open REST API (e.g., `/v1/indicators/inflation`)
- [ ] Write comprehensive API documentation
- [ ] Release Python and JavaScript SDK/Examples
- [ ] Build a plugin architecture for external data sources
- [ ] Publish reproducible Jupyter notebooks

## PHASE F — SCALE TO AFRICA
Goal: Expand the open intelligence infrastructure across the continent.
- [ ] Expand ingestion architecture to Ghana, Kenya, South Africa, Egypt, Rwanda, and Côte d'Ivoire.
- [ ] Enable cross-country comparisons (`/v1/compare/nigeria/ghana`)
