"""ETL runner – orchestrates all ETL jobs.

Usage:
    python -m app.services.etl.runner
"""

from __future__ import annotations

from app.database import SessionLocal, engine, Base
from app.services.etl.world_bank import fetch_all_world_bank
from app.services.etl.fred import fetch_all_fred
from app.services.etl.exchange_rate import fetch_exchange_rate


def run_etl():
    """Run every ETL pipeline sequentially."""
    print("Ensuring tables exist …")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("\n── World Bank ──────────────────────────")
        fetch_all_world_bank(session)

        print("\n── FRED ────────────────────────────────")
        fetch_all_fred(session)

        print("\n── Exchange Rate ───────────────────────")
        fetch_exchange_rate(session)

        print("\n✅ ETL complete!")
    except Exception as exc:
        print(f"\n❌ ETL error: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run_etl()
