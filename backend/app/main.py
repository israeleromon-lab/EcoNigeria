"""EconoNigeria – FastAPI application entry-point.

Start with:
    uvicorn app.main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import dashboard, indicators, forecasts, analyst, research, admin


import threading
from app.services.etl.runner import run_etl

# ── Lifespan ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure all tables exist.  Shutdown: dispose engine."""
    Base.metadata.create_all(bind=engine)
    # Automatically run the ETL pipeline in the background on startup
    threading.Thread(target=run_etl, daemon=True).start()
    yield
    engine.dispose()


# ── App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="EconoNigeria API",
    description="Backend API for EconoNigeria platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(indicators.router)
app.include_router(forecasts.router)
app.include_router(analyst.router)
app.include_router(research.router)
app.include_router(admin.router)


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
