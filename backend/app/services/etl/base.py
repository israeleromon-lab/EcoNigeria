"""Base class for all ETL adapters enforcing frequency constraints, provenance, and deterministic sanity validation."""

from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from datetime import datetime, timezone
import logging
import math

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.models import Indicator, HistoricalData

logger = logging.getLogger(__name__)

# Indicators that must strictly be > 0 (never negative or zero)
STRICTLY_POSITIVE_CODES = {
    "SP.POP.TOTL",
    "NY.GDP.PCAP.CD",
    "DCOILBRENTEU",
    "NGN_USD",
    "FI.RES.TOTL.CD",
    "GC.DOD.TOTL.GD.ZS",
    "SL.UEM.TOTL.ZS",
    "SI.POV.NAHC",
}

# Maximum allowed single-period absolute change (for rate/percentage indicators)
MAX_SINGLE_PERIOD_ABS_DELTA = {
    "NY.GDP.MKTP.KD.ZG": 30.0,   # >30 percentage point single-period real GDP swing
    "FP.CPI.TOTL.ZG": 65.0,      # >65 percentage point single-period annual CPI jump
    "SL.UEM.TOTL.ZS": 30.0,      # >30 percentage point jump (unless structural break)
    "SI.POV.NAHC": 25.0,         # >25 percentage point poverty jump
    "FEDFUNDS": 15.0,            # >1,500 bps single-period Fed Funds jump
}

# Maximum allowed single-period relative pct change (for level indicators)
MAX_SINGLE_PERIOD_REL_PCT = {
    "SP.POP.TOTL": 0.15,         # Population cannot jump >15% in a single year
    "FI.RES.TOTL.CD": 2.50,      # Reserves >250% single-period jump
    "DCOILBRENTEU": 2.50,        # Brent crude >250% single-period jump
}


class BaseAdapter(ABC):
    """Abstract base class for data ingestion adapters with deterministic sanity rules."""

    def __init__(self, db: Session, indicator_code: str):
        self.db = db
        self.indicator_code = indicator_code
        self.indicator = self._get_indicator()

    def _get_indicator(self) -> Indicator:
        ind = self.db.query(Indicator).filter(Indicator.code == self.indicator_code).first()
        if not ind:
            raise ValueError(f"Indicator {self.indicator_code} not found in database.")
        return ind

    def get_latest_observation(self) -> Optional[HistoricalData]:
        """Get the most recent non-null observation we have for this indicator."""
        return (
            self.db.query(HistoricalData)
            .filter(
                HistoricalData.indicator_id == self.indicator.id,
                HistoricalData.value.isnot(None),
            )
            .order_by(desc(HistoricalData.period))
            .first()
        )

    def validate_observation(
        self,
        period: str,
        value: Optional[float],
        reference_value: Optional[float] = None,
        allow_structural_break: bool = False,
    ) -> Tuple[bool, Optional[str]]:
        """
        Enforce deterministic ETL sanity and circuit-breaker rules:
        1. Null Preservation: Missing values are kept as None (never coerced to 0.0).
        2. Finite Check: NaN or Inf values are rejected.
        3. Domain Bounds: Strictly positive indicators reject value <= 0.
        4. Variance Circuit Breaker: Rejects extreme single-period outliers unless
           explicitly flagged as a verified structural break (e.g. June 2023 FX unification).
        """
        if value is None:
            # Rule 1: Preserve nulls rather than zero-filling
            return True, None

        try:
            numeric_val = float(value)
        except (TypeError, ValueError):
            return False, f"Non-numeric value payload ({value!r}) for {self.indicator_code} at {period}"

        if math.isnan(numeric_val) or math.isinf(numeric_val):
            return False, f"NaN/Inf value payload for {self.indicator_code} at {period}"

        # Rule 3: Strictly positive domain check
        if self.indicator_code in STRICTLY_POSITIVE_CODES and numeric_val <= 0.0:
            return (
                False,
                f"Domain violation: {self.indicator_code} requires > 0, got {numeric_val} at {period}",
            )

        # Rule 4: Single-period variance circuit breaker
        if reference_value is not None and not allow_structural_break:
            max_abs = MAX_SINGLE_PERIOD_ABS_DELTA.get(self.indicator_code)
            if max_abs is not None and abs(numeric_val - reference_value) > max_abs:
                return (
                    False,
                    f"Variance circuit breaker triggered for {self.indicator_code} at {period}: "
                    f"delta {abs(numeric_val - reference_value):.2f} exceeds max {max_abs}",
                )

            max_rel = MAX_SINGLE_PERIOD_REL_PCT.get(self.indicator_code)
            if max_rel is not None and reference_value > 0:
                rel_change = abs(numeric_val - reference_value) / abs(reference_value)
                if rel_change > max_rel:
                    return (
                        False,
                        f"Relative variance circuit breaker triggered for {self.indicator_code} at {period}: "
                        f"{rel_change * 100:.1f}% change exceeds {max_rel * 100:.1f}%",
                    )

        return True, None

    @abstractmethod
    def fetch_new_data(self) -> List[dict]:
        """
        Fetch new data from the external source.
        Should return a list of dictionaries containing:
        {
            "period": str, # e.g. "2024", "2024-Q1", "2024-03"
            "value": float | None,
            "observation_time": datetime,
            "publication_time": datetime (optional),
            "allow_structural_break": bool (optional),
        }
        """
        pass

    def run(self):
        """Execute the ETL process: fetch, validate against sanity rules, and save."""
        now = datetime.now(timezone.utc)

        try:
            new_data = self.fetch_new_data()
        except Exception as e:
            logger.error(f"Failed to fetch data for {self.indicator_code}: {e}")
            return

        latest_obs = self.get_latest_observation()
        ref_val = float(latest_obs.value) if (latest_obs and latest_obs.value is not None) else None

        added = 0
        quarantined = 0
        for data in new_data:
            period = str(data["period"])
            raw_val = data.get("value")
            allow_break = bool(data.get("allow_structural_break", False))

            is_valid, reason = self.validate_observation(
                period=period,
                value=raw_val,
                reference_value=ref_val,
                allow_structural_break=allow_break,
            )
            if not is_valid:
                logger.warning(f"ETL Quarantine [{self.indicator_code}]: {reason}")
                quarantined += 1
                continue

            existing = (
                self.db.query(HistoricalData)
                .filter(
                    HistoricalData.indicator_id == self.indicator.id,
                    HistoricalData.country_code == "NGA",
                    HistoricalData.period == period,
                )
                .first()
            )

            if not existing:
                obs = HistoricalData(
                    indicator_id=self.indicator.id,
                    country_code="NGA",
                    period=period,
                    value=raw_val,
                    observation_time=data["observation_time"],
                    publication_time=data.get("publication_time"),
                    source_checked_time=now,
                    native_frequency=self.indicator.native_frequency,
                )
                self.db.add(obs)
                added += 1
                if raw_val is not None:
                    ref_val = float(raw_val)
            else:
                existing.source_checked_time = now

        self.db.commit()
        logger.info(
            f"ETL completed for {self.indicator_code}: added={added}, quarantined={quarantined}"
        )
