"""Compare router – Pan-African Cross-Country Macroeconomic Comparisons."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.comparison import (
    AFRICAN_COUNTRIES,
    get_pan_african_summary,
    compare_countries,
)

router = APIRouter(prefix="/api/compare", tags=["compare"])


@router.get("/countries")
def get_supported_countries():
    """List all supported African economies available for cross-country intelligence."""
    return {
        "count": len(AFRICAN_COUNTRIES),
        "countries": list(AFRICAN_COUNTRIES.values())
    }


@router.get("")
def get_pan_african_benchmarks(db: Session = Depends(get_db)):
    """Retrieve harmonized macroeconomic matrix comparing all supported African economies."""
    summary = get_pan_african_summary(db)
    return {
        "count": len(summary),
        "benchmarks": summary
    }


@router.get("/{country_a}/{country_b}")
def get_bilateral_comparison(
    country_a: str,
    country_b: str,
    db: Session = Depends(get_db)
):
    """Retrieve deep bilateral macroeconomic diagnostic comparing two African economies."""
    try:
        result = compare_countries(country_a, country_b, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
