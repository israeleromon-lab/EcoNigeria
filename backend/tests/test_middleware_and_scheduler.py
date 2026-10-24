"""Automated tests for EconoNigeria middleware and background services."""

import time
from app.middleware.rate_limit import SlidingWindowRateLimiter, RateLimitMiddleware
from app.middleware.cache import InMemoryResponseCache, CacheControlMiddleware
from app.services.scheduler import scheduler


def test_rate_limiter_sliding_window():
    limiter = SlidingWindowRateLimiter(window_seconds=60.0)
    key = ("127.0.0.1", "default")
    limit = 2
    t0 = time.time()

    # Request 1 & 2 allowed
    ok1, rem1, _ = limiter.check_and_record(key, limit, now=t0)
    assert ok1 is True
    assert rem1 == 1

    ok2, rem2, _ = limiter.check_and_record(key, limit, now=t0 + 1)
    assert ok2 is True
    assert rem2 == 0

    # Request 3 rejected with 429 quota exhausted
    ok3, rem3, retry = limiter.check_and_record(key, limit, now=t0 + 2)
    assert ok3 is False
    assert rem3 == 0
    assert retry > 0

    # Request after window passes allowed
    ok4, rem4, _ = limiter.check_and_record(key, limit, now=t0 + 61)
    assert ok4 is True


def test_rate_limit_path_classification():
    mw = RateLimitMiddleware(app=lambda scope, receive, send: None)
    assert mw._get_bucket_and_limit("/health") is None
    assert mw._get_bucket_and_limit("/docs") is None
    cat, lim = mw._get_bucket_and_limit("/v1/indicators")
    assert cat == "default" and lim == 60
    cat, lim = mw._get_bucket_and_limit("/api/analyst/report")
    assert cat == "expensive" and lim == 15


def test_response_cache():
    cache = InMemoryResponseCache(max_entries=50)
    key = "/v1/indicators"
    body = b'{"data": "test"}'
    cache.set(key, body, 200, {"content-type": "application/json"}, ttl_seconds=1.0)
    cached = cache.get(key)
    assert cached is not None
    assert cached[0] == body

    time.sleep(1.1)
    assert cache.get(key) is None


def test_background_scheduler_status():
    status = scheduler.get_status()
    assert "jobs" in status
    assert "high_frequency_monitor" in status["jobs"]
    assert "signals_detector" in status["jobs"]
    assert "macro_etl" in status["jobs"]
