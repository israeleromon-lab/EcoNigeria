"""Rate limiting middleware for EconoNigeria API.

Protects public macroeconomic endpoints against denial-of-service, abusive scraping,
and downstream LLM/model quota exhaustion.

Enforces:
- 60 requests/minute for standard & public v1 endpoints.
- 15 requests/minute for computationally heavy endpoints (forecasting, AI report generation).
- Exemption for health probes, CORS preflight, and OpenAPI documentation.
- Standard RFC-compliant HTTP headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After.
"""

from __future__ import annotations

import math
import time
from collections import defaultdict, deque
from threading import Lock
from typing import Dict, Deque, Tuple, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.config import settings


def get_client_ip(request: Request) -> str:
    """Extract real client IP considering forward headers from reverse proxies (Render, Cloudflare, Vercel)."""
    # 1. Check X-Forwarded-For (first IP in chain is original client)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip

    # 2. Check X-Real-IP
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        client_ip = real_ip.strip()
        if client_ip:
            return client_ip

    # 3. Fallback to direct socket host
    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


class SlidingWindowRateLimiter:
    """Thread-safe in-memory sliding window rate limiter."""

    def __init__(self, window_seconds: float = 60.0, cleanup_interval: float = 300.0):
        self.window_seconds = window_seconds
        self.cleanup_interval = cleanup_interval
        self._lock = Lock()
        # Key: (client_ip, bucket_name) -> Deque of timestamps
        self._buckets: Dict[Tuple[str, str], Deque[float]] = defaultdict(deque)
        self._last_cleanup = time.time()

    def check_and_record(
        self, key: Tuple[str, str], limit: int, now: Optional[float] = None
    ) -> Tuple[bool, int, int]:
        """Check if request is allowed and record it.

        Returns:
            (is_allowed, remaining_quota, reset_or_retry_seconds)
        """
        if now is None:
            now = time.time()

        window_start = now - self.window_seconds

        with self._lock:
            # Periodic cleanup to prevent unbounded memory growth from one-off IPs
            if now - self._last_cleanup > self.cleanup_interval:
                self._cleanup(now, window_start)

            timestamps = self._buckets[key]

            # Evict timestamps older than the sliding window
            while timestamps and timestamps[0] <= window_start:
                timestamps.popleft()

            count = len(timestamps)

            if count >= limit:
                # Quota exceeded. Calculate seconds until the oldest request leaves the window
                oldest_timestamp = timestamps[0]
                retry_after = max(1, int(math.ceil(oldest_timestamp + self.window_seconds - now)))
                return False, 0, retry_after

            # Quota available: record current request timestamp
            timestamps.append(now)
            remaining = max(0, limit - (count + 1))

            # Reset is seconds until the earliest entry in current window expires
            earliest_timestamp = timestamps[0]
            reset_seconds = max(1, int(math.ceil(earliest_timestamp + self.window_seconds - now)))
            return True, remaining, reset_seconds

    def _cleanup(self, now: float, window_start: float):
        """Remove empty or fully expired buckets to bound memory usage."""
        expired_keys = []
        for key, timestamps in self._buckets.items():
            while timestamps and timestamps[0] <= window_start:
                timestamps.popleft()
            if not timestamps:
                expired_keys.append(key)
        for key in expired_keys:
            del self._buckets[key]
        self._last_cleanup = now


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Starlette/FastAPI middleware that enforces sliding window rate limits."""

    EXEMPT_EXACT_PATHS = {
        "/",
        "/health",
        "/favicon.ico",
        "/openapi.json",
        "/docs",
        "/redoc",
    }

    def __init__(self, app, window_seconds: float = 60.0):
        super().__init__(app)
        self.limiter = SlidingWindowRateLimiter(window_seconds=window_seconds)

    def _get_bucket_and_limit(self, path: str) -> Optional[Tuple[str, int]]:
        """Determine rate limit category and threshold for a given request path.

        Returns:
            (bucket_name, limit_per_minute) or None if path is exempt.
        """
        # 1. Exempt health probes & OpenAPI documentation
        if path in self.EXEMPT_EXACT_PATHS or path.startswith(("/docs/", "/redoc/")):
            return None

        # 2. Expensive endpoints: AI analysis and ML forecasting simulations
        if (
            path.startswith("/api/analyst")
            or path.startswith("/api/forecasts")
            or path.startswith("/v1/forecasts")
            or path.startswith("/api/admin/run-etl")
        ):
            return "expensive", getattr(settings, "RATE_LIMIT_EXPENSIVE_PER_MINUTE", 15)

        # 3. Standard public API endpoints & dashboard queries
        if path.startswith("/v1") or path.startswith("/api"):
            return "default", getattr(settings, "RATE_LIMIT_DEFAULT_PER_MINUTE", 60)

        # 4. Any other non-exempt application route
        return "default", getattr(settings, "RATE_LIMIT_DEFAULT_PER_MINUTE", 60)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check master feature flag
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return await call_next(request)

        # Always bypass CORS preflight requests
        if request.method.upper() == "OPTIONS":
            return await call_next(request)

        bucket_info = self._get_bucket_and_limit(request.url.path)
        if bucket_info is None:
            # Exempt endpoint (health checks, docs, etc.)
            return await call_next(request)

        bucket_name, limit = bucket_info
        client_ip = get_client_ip(request)
        key = (client_ip, bucket_name)

        allowed, remaining, reset_or_retry = self.limiter.check_and_record(key, limit)

        if not allowed:
            content = {
                "detail": f"Rate limit exceeded: maximum {limit} requests per minute for this endpoint.",
                "error": "rate_limit_exceeded",
                "limit": limit,
                "window_seconds": int(self.limiter.window_seconds),
                "retry_after": reset_or_retry,
            }
            return JSONResponse(
                status_code=429,
                content=content,
                headers={
                    "Retry-After": str(reset_or_retry),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_or_retry),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_or_retry)
        return response
