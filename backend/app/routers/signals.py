"""Signals router – Automated Macroeconomic Anomaly & Market Alerts."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.signals import detect_economic_signals

router = APIRouter(prefix="/api/signals", tags=["signals"])


@router.get("")
def get_active_signals(db: Session = Depends(get_db)):
    """Evaluate and return active real-time macroeconomic signals, warnings, and stabilizers."""
    signals = detect_economic_signals(db)
    return {
        "count": len(signals),
        "signals": signals
    }
