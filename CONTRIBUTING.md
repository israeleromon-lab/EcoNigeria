# Contributing to EconoNigeria

First off, thank you for considering contributing to EconoNigeria! It's people like you that make EconoNigeria such a great tool for economic intelligence.

We welcome contributions from everyone: economists, data scientists, software engineers, and passionate citizens.

## Code of Conduct

This project and everyone participating in it is governed by the [EconoNigeria Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 1. Adding New Data Sources
Our goal is to build a robust, transparent data layer. If you know of a reliable, public data source (e.g., CBN, NBS) that provides high-quality economic indicators for Nigeria, you can contribute by writing an ingestion adapter.
- Ensure the source allows public use of their data.
- Write Python scripts in `backend/app/services/etl/` that fetch and normalize the data into our schema.
- Add tests to verify the data ingestion format.

### 2. Improving Forecasting Models
EconoNigeria uses machine learning (Prophet, ARIMA, XGBoost) to predict future economic trends. You can contribute by:
- Fine-tuning existing models.
- Adding new models (e.g., PatchTST).
- Improving the backtesting framework.
- Contributing Jupyter notebooks to `notebooks/` with your model experiments and benchmark results.

### 3. Frontend & UI Improvements
Help us make economic data beautiful and accessible.
- Fix UI bugs in the Next.js application (`frontend/`).
- Enhance data visualizations using Recharts.
- Ensure the platform remains fully responsive across all devices.

### 4. Documentation & Research
- Write clear methodology explanations in `docs/methodology.md`.
- Ensure data sources are fully documented in `docs/data-sources.md`.
- Improve this README or add tutorials for researchers on how to use our data.

## Your First Pull Request

1. **Fork** the repo on GitHub.
2. **Clone** the project to your own machine.
3. **Commit** changes to your own branch.
4. **Push** your work back up to your fork.
5. Submit a **Pull Request** so that we can review your changes.

**Note:** Be sure to merge the latest from "upstream" before making a pull request!

## Pull Request Process

1. **Self-Review:** Ensure your code matches the existing style.
2. **Testing:** Run all tests locally (`pytest` for backend, `npm run test` for frontend) to ensure you haven't broken existing functionality.
3. **Documentation:** If you're adding a new feature, update the relevant documentation.
4. **Description:** Provide a clear description in your PR explaining *what* changed and *why*.
5. **Review:** A maintainer will review your PR. Address any feedback they provide.

## Bug Reports and Feature Requests

Please use the GitHub Issue Tracker to report bugs or request features. When submitting an issue, include:
- A clear, descriptive title.
- Steps to reproduce the bug (if applicable).
- Expected behavior vs. actual behavior.
- Screenshots, if relevant.

Thank you for helping us build the open intelligence layer for Nigeria's economy!
