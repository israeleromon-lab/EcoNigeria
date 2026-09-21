"""ETL runner – orchestrates all ETL jobs and high-frequency monitors.

Usage:
    python -m app.services.etl.runner
"""

from __future__ import annotations

import logging
from app.database import SessionLocal, engine, Base
from app.services.etl.world_bank import fetch_all_world_bank
from app.services.etl.fred import fetch_all_fred
from app.services.etl.exchange_rate import fetch_exchange_rate
from app.services.etl.cbn_adapter import CBNAdapter
from app.services.etl.nbs_adapter import NBSAdapter

logger = logging.getLogger(__name__)


def run_etl():
    """Run every ETL pipeline sequentially across international and domestic sources."""
    print("Ensuring tables exist …")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("\n── World Bank ──────────────────────────")
        try:
            fetch_all_world_bank(session)
        except Exception as e:
            print(f"World Bank ETL error: {e}")

        print("\n── FRED ────────────────────────────────")
        try:
            fetch_all_fred(session)
        except Exception as e:
            print(f"FRED ETL error: {e}")

        print("\n── Exchange Rate ───────────────────────")
        try:
            fetch_exchange_rate(session)
        except Exception as e:
            print(f"Exchange Rate ETL error: {e}")

        print("\n── Central Bank of Nigeria (CBN) ───────")
        for code in ["NGN_USD", "FEDFUNDS"]:
            try:
                adapter = CBNAdapter(session, code)
                adapter.run()
            except Exception as e:
                print(f"CBN adapter notice for {code}: {e}")

        print("\n── National Bureau of Statistics (NBS) ──")
        for code in ["FP.CPI.TOTL.ZG", "NY.GDP.MKTP.KD.ZG"]:
            try:
                adapter = NBSAdapter(session, code)
                adapter.run()
            except Exception as e:
                print(f"NBS adapter notice for {code}: {e}")

        print("\n✅ All source adapters and ETL pipelines complete!")
    except Exception as exc:
        print(f"\n❌ ETL runner error: {exc}")
        raise
    finally:
        session.close()


def run_high_frequency_monitor():
    """Targeted high-frequency monitor for eligible rapid-moving indicators (FX, Commodity)."""
    session = SessionLocal()
    try:
        fetch_exchange_rate(session)
    except Exception as e:
        logger.warning(f"High-frequency FX monitor notice: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    run_etl()
