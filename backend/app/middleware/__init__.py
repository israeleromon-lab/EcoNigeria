"""Middleware package for EconoNigeria backend."""

from app.middleware.rate_limit import RateLimitMiddleware

__all__ = ["RateLimitMiddleware"]
