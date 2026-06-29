"""ETL: Fetch the latest NGN/USD exchange rate.

The free tier of exchangerate-api.com only returns the *current* rate,
so we store one row per execution with the current year.

Usage:
    from app.services.etl.exchange_rate import fetch_exchange_rate
    fetch_exchange_rate(session)
"""

from __future__ import annotations

from datetime import datetime, timezone

import requests
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Indicator, HistoricalData


def fetch_exchange_rate(session: Session) -> float | None:
    """Fetch NGN/USD rate and upsert for the current year.

    Returns the rate on success, None on failure.
    """
    url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGE_RATE_API_KEY}/latest/USD"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()

    data = resp.json()
    if data.get("result") != "success":
        print("  ⚠ Exchange Rate API returned non-success result")
        return None

    ngn_rate = data.get("conversion_rates", {}).get("NGN")
    if ngn_rate is None:
        print("  ⚠ NGN rate not found in response")
        return None

    indicator = session.query(Indicator).filter(Indicator.code == "NGN_USD").first()
    if indicator is None:
        print("  ⚠ Indicator NGN_USD not found in DB — run seed first")
        return None

    current_year = datetime.now(timezone.utc).year
    stmt = (
        pg_insert(HistoricalData.__table__)
        .values(indicator_id=indicator.id, country_code="NGA", date=current_year, value=float(ngn_rate))
        .on_conflict_do_update(
            constraint="uq_hist_indicator_country_date",
            set_={"value": float(ngn_rate)},
        )
    )
    session.execute(stmt)
    session.commit()
    print(f"  ✓ NGN/USD = {ngn_rate} (year {current_year})")
    return float(ngn_rate)
