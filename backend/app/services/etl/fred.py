"""ETL: Fetch indicator data from the FRED (Federal Reserve) API.

Handles daily series like DCOILBRENTEU by aggregating to annual averages.

Usage:
    from app.services.etl.fred import fetch_fred
    fetch_fred("DCOILBRENTEU", session)
"""

from __future__ import annotations

from collections import defaultdict

import requests
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Indicator, HistoricalData

FRED_CODES = ["DCOILBRENTEU", "FEDFUNDS"]


def fetch_fred(code: str, session: Session) -> int:
    """Fetch FRED series, aggregate to annual averages, and upsert.

    Returns the number of annual rows upserted.
    """
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": code,
        "api_key": settings.FRED_API_KEY,
        "file_type": "json",
    }
    resp = requests.get(url, params=params, timeout=30)
    try:
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Failed to fetch FRED {code} (missing API key or network error): {e}")
        return 0

    observations = resp.json().get("observations", [])
    if not observations:
        print(f"  ⚠ No observations for FRED series {code}")
        return 0

    indicator = session.query(Indicator).filter(Indicator.code == code).first()
    if indicator is None:
        print(f"  ⚠ Indicator {code} not found in DB — run seed first")
        return 0

    # Aggregate daily/monthly values into annual averages
    yearly: dict[int, list[float]] = defaultdict(list)
    for obs in observations:
        date_str = obs.get("date", "")
        val_str = obs.get("value", ".")
        if val_str == "." or val_str == "":
            continue
        try:
            year = int(date_str[:4])
            value = float(val_str)
        except (ValueError, TypeError):
            continue
        yearly[year].append(value)

    count = 0
    for year, vals in sorted(yearly.items()):
        avg_value = round(sum(vals) / len(vals), 4)
        stmt = (
            sqlite_insert(HistoricalData.__table__)
            .values(indicator_id=indicator.id, country_code="NGA", date=year, value=avg_value)
            .on_conflict_do_update(
                index_elements=['indicator_id', 'country_code', 'date'],
                set_={"value": avg_value},
            )
        )
        session.execute(stmt)
        count += 1

    session.commit()
    return count


def fetch_all_fred(session: Session):
    """Fetch all FRED indicators."""
    for code in FRED_CODES:
        print(f"  FRED: {code} …", end=" ")
        n = fetch_fred(code, session)
        print(f"{n} rows")
