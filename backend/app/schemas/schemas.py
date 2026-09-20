"""Pydantic schemas for API request/response serialisation."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


# ── Indicator metadata ───────────────────────────────────────────────

class IndicatorBase(BaseModel):
    code: str
    name: str
    category: Optional[str] = None
    source: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None


class IndicatorOut(IndicatorBase):
    """Indicator metadata returned by the API."""
    id: int

    class Config:
        from_attributes = True


class IndicatorDetail(IndicatorOut):
    """Single indicator with its latest value."""
    latest_value: Optional[float] = None
    latest_period: Optional[str] = None


# ── Historical data ──────────────────────────────────────────────────

class DataPoint(BaseModel):
    period: str
    value: Optional[float] = None
    observation_time: Optional[str] = None
    publication_time: Optional[str] = None
    source_checked_time: Optional[str] = None


class HistoricalDataOut(BaseModel):
    code: str
    name: str
    unit: Optional[str] = None
    native_frequency: Optional[str] = None
    data: List[DataPoint]


# ── Latest value ─────────────────────────────────────────────────────

class LatestValueOut(BaseModel):
    code: str
    name: str
    unit: Optional[str] = None
    native_frequency: Optional[str] = None
    current_value: Optional[float] = None
    current_period: Optional[str] = None
    previous_value: Optional[float] = None
    previous_period: Optional[str] = None
    pct_change: Optional[float] = None


# ── Summary statistics ───────────────────────────────────────────────

class StatsOut(BaseModel):
    code: str
    name: str
    unit: Optional[str] = None
    count: int = 0
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    first_year: Optional[int] = None
    last_year: Optional[int] = None


# ── Dashboard ────────────────────────────────────────────────────────

class SparklinePoint(BaseModel):
    period: str
    value: Optional[float] = None


class DashboardIndicator(BaseModel):
    code: str
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    source: Optional[str] = None
    native_frequency: Optional[str] = None
    current_value: Optional[float] = None
    current_period: Optional[str] = None
    previous_value: Optional[float] = None
    previous_period: Optional[str] = None
    pct_change: Optional[float] = None
    last_updated: Optional[str] = None
    is_stale: bool = False
    sparkline: List[SparklinePoint] = []


class DashboardOut(BaseModel):
    indicators: List[DashboardIndicator]


# ── System Status & Economic Pulse (EconoNigeria 2.0) ───────────────

class SourceStatus(BaseModel):
    key: str
    name: str
    status: str  # "operational" | "degraded" | "in_development"
    native_frequency: str
    indicators_count: int
    total_observations: int
    latest_period: Optional[str] = None
    last_checked: Optional[str] = None


class PulseDriver(BaseModel):
    indicator: str
    direction: str  # "drag" | "neutral" | "support"
    impact: str


class EconomicPulse(BaseModel):
    score: int  # 0 to 100
    rating: str  # "Resilient" | "Moderate" | "Strained" | "Vulnerable"
    summary: str
    drivers: List[PulseDriver] = []
    last_computed: str


class SystemStatusOut(BaseModel):
    status: str  # "operational" | "degraded"
    environment: str
    database_engine: str
    timestamp: str
    total_indicators: int
    total_observations: int
    stale_indicators_count: int
    freshness_percentage: float
    sources: List[SourceStatus]
    economic_pulse: EconomicPulse

