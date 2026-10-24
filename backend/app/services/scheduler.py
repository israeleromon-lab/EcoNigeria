"""Background task scheduler for EconoNigeria backend.

Orchestrates periodic background jobs:
1. High-frequency market monitor (FX & commodity spot rates every 5 minutes).
2. Economic signals detector (scans for macro anomalies every 15 minutes).
3. Macroeconomic ETL update (World Bank, FRED, NBS, CBN scheduled every 12 hours).
4. Cache & memory maintenance.
"""

from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.database import SessionLocal
from app.services.etl.runner import run_etl, run_high_frequency_monitor
from app.services.signals import detect_economic_signals

logger = logging.getLogger(__name__)


class BackgroundScheduler:
    """Thread-safe background job scheduler running as a daemon inside FastAPI lifespan."""

    def __init__(self):
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._job_status: Dict[str, Dict[str, Any]] = {
            "high_frequency_monitor": {
                "name": "High-Frequency FX & Commodity Monitor",
                "interval_seconds": 300,  # 5 minutes
                "last_run": None,
                "last_status": "pending",
                "total_runs": 0,
            },
            "signals_detector": {
                "name": "Economic Anomaly & Signals Detector",
                "interval_seconds": 900,  # 15 minutes
                "last_run": None,
                "last_status": "pending",
                "total_runs": 0,
            },
            "macro_etl": {
                "name": "Multi-Source Macroeconomic ETL Pipeline",
                "interval_seconds": 43200,  # 12 hours
                "last_run": None,
                "last_status": "pending",
                "total_runs": 0,
            },
        }

    def start(self):
        """Start the scheduler background thread."""
        if self._thread is not None and self._thread.is_alive():
            logger.info("BackgroundScheduler is already running.")
            return

        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._run_loop, daemon=True, name="EconoNigeria-BackgroundScheduler"
        )
        self._thread.start()
        logger.info("BackgroundScheduler started successfully.")

    def stop(self):
        """Signal scheduler to stop cleanly."""
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=3)
            logger.info("BackgroundScheduler terminated cleanly.")

    def get_status(self) -> Dict[str, Any]:
        """Return live health and execution metrics for background jobs."""
        return {
            "scheduler_running": self._thread is not None and self._thread.is_alive(),
            "jobs": self._job_status,
        }

    def _run_loop(self):
        """Main periodic polling loop."""
        # Initial 10-second grace period after application startup
        if self._stop_event.wait(timeout=10):
            return

        # Run high-frequency monitor and signals detection immediately after initial startup
        self._execute_job("high_frequency_monitor", run_high_frequency_monitor)
        self._execute_job("signals_detector", self._run_signals_job)

        last_hf = time.time()
        last_signals = time.time()
        last_etl = time.time()  # Startup ETL runs separately

        while not self._stop_event.is_set():
            now = time.time()

            # 1. High-frequency monitor (every 5 minutes)
            if now - last_hf >= self._job_status["high_frequency_monitor"]["interval_seconds"]:
                self._execute_job("high_frequency_monitor", run_high_frequency_monitor)
                last_hf = time.time()

            # 2. Economic signals anomaly scan (every 15 minutes)
            if now - last_signals >= self._job_status["signals_detector"]["interval_seconds"]:
                self._execute_job("signals_detector", self._run_signals_job)
                last_signals = time.time()

            # 3. Full macro ETL pipeline (every 12 hours)
            if now - last_etl >= self._job_status["macro_etl"]["interval_seconds"]:
                self._execute_job("macro_etl", run_etl)
                last_etl = time.time()

            # Sleep in short slices (10 seconds) for responsive shutdown
            self._stop_event.wait(timeout=10)

    def _execute_job(self, job_key: str, func):
        try:
            func()
            self._job_status[job_key]["last_run"] = datetime.now(timezone.utc).isoformat()
            self._job_status[job_key]["last_status"] = "success"
            self._job_status[job_key]["total_runs"] += 1
            logger.info(f"Background job '{job_key}' completed successfully.")
        except Exception as exc:
            self._job_status[job_key]["last_run"] = datetime.now(timezone.utc).isoformat()
            self._job_status[job_key]["last_status"] = f"error: {str(exc)}"
            logger.error(f"Background job '{job_key}' failed: {exc}", exc_info=True)

    def _run_signals_job(self):
        session = SessionLocal()
        try:
            detect_economic_signals(session)
        finally:
            session.close()


# Singleton background scheduler
scheduler = BackgroundScheduler()
