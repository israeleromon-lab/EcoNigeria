"""ETL: Fetch indicator data from the World Bank Indicators API.

Usage:
    from app.services.etl.world_bank import fetch_world_bank
    fetch_world_bank("SP.POP.TOTL", session)
"""

from __future__ import annotations

import warnings

import requests
from urllib3.exceptions import InsecureRequestWarning
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Indicator, HistoricalData

# Suppress SSL warnings (known local SSL inspection issue)
warnings.filterwarnings("ignore", category=InsecureRequestWarning)

# Indicator codes sourced from the World Bank
WB_CODES = [
    "SP.POP.TOTL",
    "NY.GDP.PCAP.CD",
    "FP.CPI.TOTL.ZG",
    "NY.GDP.MKTP.KD.ZG",
    "SL.UEM.TOTL.ZS",
    "GC.DOD.TOTL.GD.ZS",
    "BX.KLT.DINV.CD.WD",
]


def fetch_world_bank(code: str, session: Session) -> int:
    """Fetch data for *code* from the World Bank API and upsert into DB.

    Returns the number of rows upserted.
    """
    url = f"{settings.WORLD_BANK_BASE_URL}/country/NGA/indicator/{code}"
    params = {"format": "json", "per_page": 1000}
    resp = requests.get(url, params=params, timeout=30, verify=False)
    try:
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Failed to fetch World Bank {code}: {e}")
        return 0

    payload = resp.json()
    # World Bank returns [metadata, data_array]
    if not isinstance(payload, list) or len(payload) < 2:
        print(f"  ⚠ Unexpected response for {code}")
        return 0

    records = payload[1]
    if records is None:
        print(f"  ⚠ No records returned for {code}")
        return 0

    indicator = session.query(Indicator).filter(Indicator.code == code).first()
    if indicator is None:
        print(f"  ⚠ Indicator {code} not found in DB — run seed first")
        return 0

    count = 0
    for rec in records:
        try:
            year = int(rec["date"])
        except (ValueError, TypeError):
            continue
        value = rec.get("value")
        if value is not None:
            value = float(value)

        stmt = (
            sqlite_insert(HistoricalData.__table__)
            .values(indicator_id=indicator.id, country_code="NGA", date=year, value=value)
            .on_conflict_do_update(
                index_elements=['indicator_id', 'country_code', 'date'],
                set_={"value": value},
            )
        )
        session.execute(stmt)
        count += 1

    session.commit()
    return count


def fetch_all_world_bank(session: Session):
    """Fetch all World Bank indicators."""
    for code in WB_CODES:
        print(f"  World Bank: {code} …", end=" ")
        n = fetch_world_bank(code, session)
        print(f"{n} rows")
