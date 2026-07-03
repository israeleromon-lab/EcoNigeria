"""Seed the database from CSV files in datasets/raw/ and the combined
datasets/nigeria_macro_data.csv.

Usage:
    python -m app.services.seed
"""

from __future__ import annotations

import csv
import math
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import SessionLocal, engine
from app.database import Base
from app.models import Indicator, HistoricalData

# ── Indicator registry ───────────────────────────────────────────────

INDICATORS = [
    {"code": "SP.POP.TOTL", "name": "Total Population", "category": "Demographics", "source": "World Bank", "unit": "People", "description": "Total population count"},
    {"code": "NY.GDP.PCAP.CD", "name": "GDP Per Capita", "category": "Economic Growth", "source": "World Bank", "unit": "USD", "description": "GDP per capita in current US dollars"},
    {"code": "FP.CPI.TOTL.ZG", "name": "Inflation Rate", "category": "Prices", "source": "World Bank", "unit": "%", "description": "Consumer price inflation, annual %"},
    {"code": "NY.GDP.MKTP.KD.ZG", "name": "GDP Growth Rate", "category": "Economic Growth", "source": "World Bank", "unit": "%", "description": "Annual GDP growth rate"},
    {"code": "SL.UEM.TOTL.ZS", "name": "Unemployment Rate", "category": "Labor", "source": "World Bank", "unit": "%", "description": "Unemployment as % of total labor force"},
    {"code": "GC.DOD.TOTL.GD.ZS", "name": "Government Debt", "category": "Fiscal", "source": "World Bank", "unit": "% of GDP", "description": "Central government debt as % of GDP"},
    {"code": "BX.KLT.DINV.CD.WD", "name": "Foreign Direct Investment", "category": "Investment", "source": "World Bank", "unit": "USD", "description": "Foreign direct investment, net inflows"},
    {"code": "DCOILBRENTEU", "name": "Brent Oil Price", "category": "Energy", "source": "FRED", "unit": "USD/barrel", "description": "Brent crude oil price in USD per barrel"},
    {"code": "FEDFUNDS", "name": "Federal Funds Rate", "category": "Monetary Policy", "source": "FRED", "unit": "%", "description": "US Federal Funds effective rate"},
    {"code": "NGN_USD", "name": "Exchange Rate (NGN/USD)", "category": "Currency", "source": "Exchange Rate API", "unit": "NGN per USD", "description": "Nigerian Naira to US Dollar exchange rate"},
]

# Map CSV column names (from raw/ individual files) → indicator codes
_INDIVIDUAL_CSV_MAP: dict[str, tuple[str, str]] = {
    # filename  →  (csv_value_column, indicator_code)
    "population.csv": ("population", "SP.POP.TOTL"),
    "gdp_per_capita.csv": ("gdp_per_capita", "NY.GDP.PCAP.CD"),
    "inflation.csv": ("inflation", "FP.CPI.TOTL.ZG"),
    "gdp_growth.csv": ("gdp_growth", "NY.GDP.MKTP.KD.ZG"),
    "unemployment.csv": ("unemployment", "SL.UEM.TOTL.ZS"),
    "exchange_rate.csv": ("value", "NGN_USD"),
    "brent_oil.csv": ("value", "DCOILBRENTEU"),
    "federal_funds.csv": ("value", "FEDFUNDS"),
    "government_debt.csv": ("value", "GC.DOD.TOTL.GD.ZS"),
}

# Columns in the combined CSV → indicator codes
_COMBINED_CSV_MAP: dict[str, str] = {
    "Population": "SP.POP.TOTL",
    "GDP_Per_Capita": "NY.GDP.PCAP.CD",
    "Inflation": "FP.CPI.TOTL.ZG",
    "Gdp Growth": "NY.GDP.MKTP.KD.ZG",
    "Unemployment": "SL.UEM.TOTL.ZS",
}

# ── paths ────────────────────────────────────────────────────────────

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # backend/ or /app
_RAW_DIR = _PROJECT_ROOT / "datasets" / "raw"
_COMBINED_CSV = _PROJECT_ROOT / "datasets" / "nigeria_macro_data.csv"


def _safe_float(val: str) -> float | None:
    """Convert string to float; return None for empty / non-numeric."""
    if val is None:
        return None
    val = val.strip()
    if val == "" or val.lower() == "nan":
        return None
    try:
        f = float(val)
        return None if math.isnan(f) else f
    except (ValueError, TypeError):
        return None


def _safe_int(val: str) -> int | None:
    f = _safe_float(val)
    return int(f) if f is not None else None


# ── seed logic ───────────────────────────────────────────────────────

def get_insert():
    from app.database import engine
    if engine.dialect.name == "sqlite":
        from sqlalchemy.dialects.sqlite import insert
        return insert
    else:
        from sqlalchemy.dialects.postgresql import insert
        return insert

def seed_indicators(session) -> dict[str, int]:
    """Upsert indicator metadata. Returns code → id mapping."""
    code_to_id: dict[str, int] = {}
    insert = get_insert()
    from app.database import engine
    for meta in INDICATORS:
        kwargs = {"set_": {k: v for k, v in meta.items() if k != "code"}}
        if engine.dialect.name == "sqlite":
            kwargs["index_elements"] = ["code"]
        else:
            kwargs["constraint"] = "uq_indicator_code"

        stmt = insert(Indicator.__table__).values(**meta).on_conflict_do_update(**kwargs)
        
        if engine.dialect.name != "sqlite":
            stmt = stmt.returning(Indicator.__table__.c.id)
            result = session.execute(stmt)
            row = result.fetchone()
            code_to_id[meta["code"]] = row[0]
        else:
            session.execute(stmt)
            row = session.execute(Indicator.__table__.select().where(Indicator.__table__.c.code == meta["code"])).fetchone()
            code_to_id[meta["code"]] = row[0]
    session.commit()
    return code_to_id


def _upsert_data(session, indicator_id: int, year: int, value: float | None):
    """Upsert a single historical_data row."""
    insert = get_insert()
    from app.database import engine
    
    kwargs = {"set_": {"value": value}}
    if engine.dialect.name == "sqlite":
        kwargs["index_elements"] = ["indicator_id", "country_code", "date"]
    else:
        kwargs["constraint"] = "uq_hist_indicator_country_date"

    stmt = (
        insert(HistoricalData.__table__)
        .values(indicator_id=indicator_id, country_code="NGA", date=year, value=value)
        .on_conflict_do_update(**kwargs)
    )
    session.execute(stmt)


def seed_from_individual_csvs(session, code_to_id: dict[str, int]):
    """Load data from the per-indicator CSVs in datasets/raw/."""
    for filename, (col_name, code) in _INDIVIDUAL_CSV_MAP.items():
        csv_path = _RAW_DIR / filename
        if not csv_path.exists():
            print(f"  [WARN] {csv_path} not found — skipping")
            continue
        indicator_id = code_to_id.get(code)
        if indicator_id is None:
            continue

        count = 0
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                year = _safe_int(row.get("date", ""))
                value = _safe_float(row.get(col_name, ""))
                if year is None:
                    continue
                _upsert_data(session, indicator_id, year, value)
                count += 1
        session.commit()
        print(f"  [OK] {filename}: {count} rows -> {code}")


def seed_from_combined_csv(session, code_to_id: dict[str, int]):
    """Load additional columns from the combined macro CSV."""
    if not _COMBINED_CSV.exists():
        print(f"  [WARN] {_COMBINED_CSV} not found — skipping combined CSV")
        return
    with open(_COMBINED_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            year = _safe_int(row.get("Date", ""))
            if year is None:
                continue
            for col_name, code in _COMBINED_CSV_MAP.items():
                indicator_id = code_to_id.get(code)
                if indicator_id is None:
                    continue
                value = _safe_float(row.get(col_name, ""))
                if value is None:
                    continue  # individual CSVs already have the data
                _upsert_data(session, indicator_id, year, value)
    session.commit()
    print("  [OK] Combined CSV merged")


def run_seed():
    """Full seed: create tables, upsert indicators, load CSVs."""
    print("Creating tables ...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("Seeding indicators ...")
        code_to_id = seed_indicators(session)
        print(f"  {len(code_to_id)} indicators upserted")

        print("Seeding historical data from individual CSVs ...")
        seed_from_individual_csvs(session, code_to_id)

        print("Merging combined CSV ...")
        seed_from_combined_csv(session, code_to_id)

        print("[DONE] Seed complete!")
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
