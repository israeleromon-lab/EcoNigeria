"""SQLAlchemy ORM models for EconoNigeria."""

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Indicator(Base):
    """Metadata for each tracked economic indicator."""

    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100))
    source = Column(String(100))
    unit = Column(String(100))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    # relationships
    data_points = relationship("HistoricalData", back_populates="indicator", lazy="dynamic")
    forecasts = relationship("Forecast", back_populates="indicator", lazy="dynamic")
    metrics = relationship("ModelMetric", back_populates="indicator", lazy="dynamic")


class HistoricalData(Base):
    """Yearly historical observation for an indicator."""

    __tablename__ = "historical_data"
    __table_args__ = (
        UniqueConstraint("indicator_id", "country_code", "date", name="uq_hist_indicator_country_date"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    indicator_id = Column(Integer, ForeignKey("indicators.id"), nullable=False, index=True)
    country_code = Column(String(10), default="NGA")
    date = Column(Integer, nullable=False)  # year
    value = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    indicator = relationship("Indicator", back_populates="data_points")


class Forecast(Base):
    """Model-generated forecast value (Phase 2)."""

    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    indicator_id = Column(Integer, ForeignKey("indicators.id"), nullable=False, index=True)
    date = Column(Integer, nullable=False)
    value = Column(Float, nullable=True)
    model_name = Column(String(50))
    horizon = Column(String(20))
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    indicator = relationship("Indicator", back_populates="forecasts")


class ModelMetric(Base):
    """Evaluation metrics for a trained model (Phase 2)."""

    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    indicator_id = Column(Integer, ForeignKey("indicators.id"), nullable=False, index=True)
    model_name = Column(String(50))
    rmse = Column(Float)
    mae = Column(Float)
    mape = Column(Float)
    trained_at = Column(DateTime(timezone=True), default=_utcnow)

    indicator = relationship("Indicator", back_populates="metrics")


class SavedReport(Base):
    """User-saved AI Economic Analyst report (Phase 3)."""

    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    insights = Column(Text, nullable=False) # Store JSON string of insights
    outlook = Column(String(50))
    risk_factors = Column(Text) # Store JSON string of risk factors
    created_at = Column(DateTime(timezone=True), default=_utcnow)
