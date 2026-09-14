"""Base class for all ETL adapters enforcing frequency constraints and provenance."""

from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime, timezone
import logging

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.models import Indicator, HistoricalData

logger = logging.getLogger(__name__)

class BaseAdapter(ABC):
    """Abstract base class for data ingestion adapters."""

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
        """Get the most recent observation we have for this indicator."""
        return (
            self.db.query(HistoricalData)
            .filter(HistoricalData.indicator_id == self.indicator.id)
            .order_by(desc(HistoricalData.period))
            .first()
        )

    @abstractmethod
    def fetch_new_data(self) -> List[dict]:
        """
        Fetch new data from the external source.
        Should return a list of dictionaries containing:
        {
            "period": str, # e.g. "2024", "2024-Q1", "2024-03"
            "value": float,
            "observation_time": datetime,
            "publication_time": datetime (optional),
        }
        """
        pass

    def run(self):
        """Execute the ETL process: fetch, check frequency, and save."""
        now = datetime.now(timezone.utc)
        
        try:
            new_data = self.fetch_new_data()
        except Exception as e:
            logger.error(f"Failed to fetch data for {self.indicator_code}: {e}")
            return

        added = 0
        for data in new_data:
            # If we already have this period, skip it or update it.
            existing = self.db.query(HistoricalData).filter(
                HistoricalData.indicator_id == self.indicator.id,
                HistoricalData.country_code == "NGA",
                HistoricalData.period == data["period"]
            ).first()

            if not existing:
                obs = HistoricalData(
                    indicator_id=self.indicator.id,
                    country_code="NGA",
                    period=data["period"],
                    value=data["value"],
                    observation_time=data["observation_time"],
                    publication_time=data.get("publication_time"),
                    source_checked_time=now,
                    native_frequency=self.indicator.native_frequency
                )
                self.db.add(obs)
                added += 1
            else:
                existing.source_checked_time = now

        if added > 0:
            self.db.commit()
            logger.info(f"Added {added} new records for {self.indicator_code}")
        else:
            self.db.commit()
            logger.info(f"No new records for {self.indicator_code}")
