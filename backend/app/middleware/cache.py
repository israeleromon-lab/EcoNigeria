"""HTTP Caching & in-memory response cache middleware for EconoNigeria FastAPI backend.

Provides:
- Edge & browser HTTP Cache-Control headers (stale-while-revalidate) for fast client rendering.
- Ultra-low latency in-memory cache for high-frequency dashboard, pulse, and catalog queries.
- X-Cache telemetry headers (HIT / MISS).
"""

from __future__ import annotations

import time
from threading import Lock
from typing import Dict, Tuple, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class InMemoryResponseCache:
    """Thread-safe TTL response cache with automatic size bounding."""

    def __init__(self, max_entries: int = 250):
        self.max_entries = max_entries
        self._lock = Lock()
        # Key: (method, path, query_string) -> (body_bytes, status_code, headers_dict, expire_timestamp)
        self._cache: Dict[str, Tuple[bytes, int, Dict[str, str], float]] = {}

    def get(self, key: str) -> Optional[Tuple[bytes, int, Dict[str, str]]]:
        now = time.time()
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            body, status, headers, expire_time = entry
            if now > expire_time:
                del self._cache[key]
                return None
            return body, status, headers

    def set(self, key: str, body: bytes, status: int, headers: Dict[str, str], ttl_seconds: float):
        now = time.time()
        with self._lock:
            # Simple eviction if max entries reached
            if len(self._cache) >= self.max_entries:
                # Remove expired or first 50 keys
                keys_to_remove = [k for k, (_, _, _, exp) in self._cache.items() if now > exp]
                if len(keys_to_remove) < 20:
                    keys_to_remove = list(self._cache.keys())[:50]
                for k in keys_to_remove:
                    self._cache.pop(k, None)

            self._cache[key] = (body, status, headers, now + ttl_seconds)

    def clear(self):
        with self._lock:
            self._cache.clear()


class CacheControlMiddleware(BaseHTTPMiddleware):
    """Middleware that injects HTTP Cache-Control headers and serves cached responses."""

    # Paths with in-memory caching and corresponding TTL in seconds
    IN_MEMORY_CACHE_ROUTES: Dict[str, float] = {
        "/api/dashboard/summary": 60.0,
        "/api/dashboard": 60.0,
        "/v1/indicators": 300.0,
        "/v1/pulse": 60.0,
        "/api/signals": 120.0,
        "/v1/signals": 120.0,
        "/v1/events": 300.0,
        "/api/status": 30.0,
    }

    def __init__(self, app):
        super().__init__(app)
        self.cache = InMemoryResponseCache(max_entries=300)

    def _get_cache_control_header(self, path: str) -> Optional[str]:
        """Determine appropriate Cache-Control header based on data cadence."""
        if path.startswith(("/v1/indicators", "/api/indicators")):
            # Macro indicators change at native frequency (monthly/quarterly/annual)
            return "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"

        if path.startswith(("/v1/pulse", "/api/dashboard", "/api/signals", "/v1/signals")):
            # High-level summary & signals
            return "public, max-age=60, s-maxage=300, stale-while-revalidate=3600"

        if path.startswith(("/v1/events", "/v1/compare")):
            # Historical events and comparative models
            return "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400"

        return None

    def _get_in_memory_ttl(self, path: str) -> Optional[float]:
        """Check if path is eligible for in-memory response caching."""
        for route_prefix, ttl in self.IN_MEMORY_CACHE_ROUTES.items():
            if path == route_prefix or path.startswith(route_prefix + "/"):
                return ttl
        return None

    async def dispatch(self, request: Request, call_next) -> Response:
        # Only cache GET requests without authorization headers
        if request.method.upper() != "GET" or "authorization" in request.headers:
            return await call_next(request)

        path = request.url.path
        query = str(request.url.query)
        cache_key = f"{path}?{query}" if query else path

        ttl = self._get_in_memory_ttl(path)

        # 1. Attempt in-memory cache lookup
        if ttl is not None:
            cached = self.cache.get(cache_key)
            if cached is not None:
                body, status, headers = cached
                headers_copy = dict(headers)
                headers_copy["X-Cache"] = "HIT"
                return Response(
                    content=body,
                    status_code=status,
                    headers=headers_copy,
                    media_type=headers_copy.get("content-type", "application/json"),
                )

        # 2. Execute request handler
        response: Response = await call_next(request)

        # 3. Add Cache-Control headers if not already set
        cc_header = self._get_cache_control_header(path)
        if cc_header and "cache-control" not in response.headers:
            response.headers["Cache-Control"] = cc_header

        response.headers["X-Cache"] = "MISS"

        # 4. Store successful JSON/text GET responses in in-memory cache
        if ttl is not None and response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type or "text/csv" in content_type:
                # Consume response body to cache it
                body_bytes = b""
                async for chunk in response.body_iterator:
                    body_bytes += chunk if isinstance(chunk, bytes) else chunk.encode("utf-8")

                cached_headers = {
                    k: v
                    for k, v in response.headers.items()
                    if k.lower() not in {"x-cache", "content-length"}
                }
                self.cache.set(cache_key, body_bytes, response.status_code, cached_headers, ttl)

                return Response(
                    content=body_bytes,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=content_type,
                )

        return response
