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
    latest_date: Optional[int] = None


# ── Historical data ──────────────────────────────────────────────────

class DataPoint(BaseModel):
    date: int
    value: Optional[float] = None


class HistoricalDataOut(BaseModel):
    code: str
    name: str
    unit: Optional[str] = None
    data: List[DataPoint]


# ── Latest value ─────────────────────────────────────────────────────

class LatestValueOut(BaseModel):
    code: str
    name: str
    unit: Optional[str] = None
    current_value: Optional[float] = None
    current_date: Optional[int] = None
    previous_value: Optional[float] = None
    previous_date: Optional[int] = None
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
    date: int
    value: Optional[float] = None


class DashboardIndicator(BaseModel):
    code: str
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    current_value: Optional[float] = None
    current_date: Optional[int] = None
    previous_value: Optional[float] = None
    previous_date: Optional[int] = None
    pct_change: Optional[float] = None
    sparkline: List[SparklinePoint] = []


class DashboardOut(BaseModel):
    indicators: List[DashboardIndicator]
