"""EconoNigeria – FastAPI application entry-point.

Start with:
    uvicorn app.main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.middleware import RateLimitMiddleware, CacheControlMiddleware
from app.routers import dashboard, indicators, forecasts, analyst, research, admin, status, v1, signals, compare
from app.services.scheduler import scheduler


import threading
from app.services.etl.runner import run_etl

# ── Lifespan ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure all tables exist and activate background scheduler. Shutdown: dispose cleanly."""
    Base.metadata.create_all(bind=engine)
    # Run initial ETL pipeline on startup in thread
    threading.Thread(target=run_etl, daemon=True, name="Initial-ETL").start()
    # Start periodic background jobs (high-frequency monitoring, signals detection, scheduled ETL)
    scheduler.start()
    yield
    scheduler.stop()
    engine.dispose()


# ── App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="EconoNigeria API",
    description="Backend API for EconoNigeria platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# Apply Caching & Rate Limiting Middlewares
app.add_middleware(CacheControlMiddleware)
app.add_middleware(RateLimitMiddleware)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
        "X-Cache",
        "Cache-Control",
    ],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(indicators.router)
app.include_router(forecasts.router)
app.include_router(analyst.router)
app.include_router(research.router)
app.include_router(admin.router)
app.include_router(status.router)
app.include_router(v1.router)
app.include_router(signals.router)
app.include_router(compare.router)


@app.get("/", tags=["health"])
def root():
    """Health-check / welcome endpoint."""
    return {
        "service": "EconoNigeria API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
def health():
    """Lightweight health probe."""
    return {"status": "ok"}
