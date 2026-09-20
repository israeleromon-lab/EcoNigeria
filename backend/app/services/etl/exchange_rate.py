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
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine
from app.models import Indicator, HistoricalData


def fetch_exchange_rate(session: Session) -> float | None:
    """Fetch NGN/USD rate and upsert for the current year.

    Returns the rate on success, None on failure.
    """
    if not settings.EXCHANGE_RATE_API_KEY:
        print("  ⚠ Exchange Rate API key is missing")
        return None

    try:
        url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGE_RATE_API_KEY}/latest/USD"
        resp = requests.get(url, timeout=30, verify=False)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Failed to fetch Exchange Rate (missing API key or network error): {e}")
        return None

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

    # Select the insert implementation for the active database dialect.
    if engine.dialect.name == "sqlite":
        from sqlalchemy.dialects.sqlite import insert
    elif engine.dialect.name == "postgresql":
        from sqlalchemy.dialects.postgresql import insert
    else:
        print(f"  ⚠ Unsupported database dialect: {engine.dialect.name}")
        return None

    now = datetime.now(timezone.utc)
    current_year = now.year
    stmt = (
        insert(HistoricalData.__table__)
        .values(
            indicator_id=indicator.id,
            country_code="NGA",
            period=str(current_year),
            value=float(ngn_rate),
            observation_time=now.isoformat(),
            native_frequency="Daily",
            source_checked_time=now.isoformat(),
        )
        .on_conflict_do_update(
            index_elements=["indicator_id", "country_code", "period"],
            set_={
                "value": float(ngn_rate),
                "observation_time": now.isoformat(),
                "source_checked_time": now.isoformat(),
            },
        )
    )
    session.execute(stmt)
    session.commit()
    print(f"  ✓ NGN/USD = {ngn_rate} (year {current_year})")
    return float(ngn_rate)
