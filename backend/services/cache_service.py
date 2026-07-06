"""
FORGE — Cache Service
Centralized Redis key strategy. One place to manage all cache keys,
TTLs, and invalidation logic. Never use raw cache.get/set in views.

Key naming convention:
  forge:{user_id}:{resource}:{variant}

TTL Strategy:
  - Today/Dashboard: 60s  (changes on every completion)
  - Analytics:       300s (changes nightly via rollup)
  - Streak:          120s (changes on completion)
  - Badges:          600s (rarely changes)
  - Leaderboard:     180s (shared, high read fan-out)
  - Life Tree:       300s (changes on streak update)
"""
import json
import hashlib
from typing import Any, Optional, Callable
from datetime import date
from functools import wraps
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────
# TTL Constants (seconds)
# ─────────────────────────────────────────────────────────
TTL_TODAY         = 60       # Today dashboard
TTL_DASHBOARD     = 60       # Aggregated dashboard endpoint
TTL_STREAK        = 120      # Streak widget
TTL_ANALYTICS_W   = 300      # Weekly analytics
TTL_ANALYTICS_M   = 600      # Monthly analytics
TTL_ANALYTICS_Y   = 1800     # Year analytics (expensive)
TTL_HEATMAP       = 3600     # Calendar heatmap (changes nightly)
TTL_BADGES        = 600      # Badge list (changes rarely)
TTL_LEADERBOARD   = 180      # Discipline league (shared hot read)
TTL_LIFE_TREE     = 300      # Life tree state
TTL_DNA           = 600      # Discipline DNA
TTL_REPLAY        = 86400    # Monthly replay (generated once)
TTL_NOTIF_COUNT   = 30       # Notification unread count


class CacheService:
    """
    All cache operations go through here.
    Provides: get, set, delete, get_or_set, invalidate_user.
    """

    @staticmethod
    def _key(user_id: str, resource: str, variant: str = "") -> str:
        """Builds a namespaced cache key."""
        base = f"forge:{user_id}:{resource}"
        if variant:
            base = f"{base}:{variant}"
        return base

    @staticmethod
    def get(user_id: str, resource: str, variant: str = "") -> Optional[Any]:
        key = CacheService._key(user_id, resource, variant)
        raw = cache.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return raw

    @staticmethod
    def set(user_id: str, resource: str, data: Any, ttl: int, variant: str = ""):
        key = CacheService._key(user_id, resource, variant)
        try:
            cache.set(key, json.dumps(data, default=str), ttl)
        except Exception as e:
            logger.warning("Cache set failed for key %s: %s", key, e)

    @staticmethod
    def delete(user_id: str, resource: str, variant: str = ""):
        key = CacheService._key(user_id, resource, variant)
        cache.delete(key)

    @staticmethod
    def get_or_set(
        user_id: str,
        resource: str,
        compute_fn: Callable,
        ttl: int,
        variant: str = "",
    ) -> Any:
        """
        Returns cached value if exists, otherwise calls compute_fn(),
        caches the result, and returns it.
        """
        cached = CacheService.get(user_id, resource, variant)
        if cached is not None:
            return cached
        data = compute_fn()
        CacheService.set(user_id, resource, data, ttl, variant)
        return data

    @staticmethod
    def invalidate_today(user_id: str):
        """Invalidates all today-related caches. Call on every completion."""
        from datetime import date, timedelta
        today = date.today()
        dates = [
            "",
            today.isoformat(),
            (today - timedelta(days=1)).isoformat(),
            (today + timedelta(days=1)).isoformat(),
        ]
        keys = []
        for d in dates:
            keys.extend([
                CacheService._key(user_id, "dashboard", d),
                CacheService._key(user_id, "today", d),
                CacheService._key(user_id, "widget_bundle", d),
                CacheService._key(user_id, "streak", d),
            ])
        cache.delete_many(keys)

    @staticmethod
    def invalidate_analytics(user_id: str):
        """Invalidates all analytics caches. Call after DayLog rollup."""
        from datetime import date, timedelta
        today = date.today()
        year = today.year
        dates = [
            "",
            today.isoformat(),
            (today - timedelta(days=1)).isoformat(),
            (today + timedelta(days=1)).isoformat(),
        ]
        months = [f"{year}-{m:02d}" for m in range(1, 13)] + [f"{year-1}-{m:02d}" for m in range(1, 13)]
        years = [str(year), str(year - 1), ""]
        heatmaps = ["rolling", str(year), str(year - 1), ""]

        keys_to_delete = []
        for d in dates:
            keys_to_delete.append(CacheService._key(user_id, "analytics_weekly", d))
        for m in months:
            keys_to_delete.append(CacheService._key(user_id, "analytics_monthly", m))
            keys_to_delete.append(CacheService._key(user_id, "replay", m))
        for y in years:
            keys_to_delete.append(CacheService._key(user_id, "analytics_year", y))
        for h in heatmaps:
            keys_to_delete.append(CacheService._key(user_id, "heatmap", h))

        keys_to_delete.extend([
            CacheService._key(user_id, "life_tree"),
            CacheService._key(user_id, "discipline_score"),
            CacheService._key(user_id, "dna"),
        ])
        cache.delete_many(keys_to_delete)

    @staticmethod
    def invalidate_badges(user_id: str):
        cache.delete(CacheService._key(user_id, "badges"))

    @staticmethod
    def invalidate_all(user_id: str):
        """Nuclear option — invalidates everything for a user."""
        CacheService.invalidate_today(user_id)
        CacheService.invalidate_analytics(user_id)
        CacheService.invalidate_badges(user_id)

    @staticmethod
    def leaderboard_key(season: str) -> str:
        """Shared leaderboard key — NOT per-user."""
        return f"forge:leaderboard:{season}"

    @staticmethod
    def get_leaderboard(season: str) -> Optional[Any]:
        raw = cache.get(CacheService.leaderboard_key(season))
        if raw is None:
            return None
        return json.loads(raw)

    @staticmethod
    def set_leaderboard(season: str, data: Any):
        key = CacheService.leaderboard_key(season)
        cache.set(key, json.dumps(data, default=str), TTL_LEADERBOARD)


def cache_response(resource: str, ttl: int, variant_fn: Callable = None):
    """
    Decorator for API views. Caches the full response body per-user.

    Usage:
        @cache_response("analytics_weekly", TTL_ANALYTICS_W)
        def weekly_analytics(request): ...

        # With dynamic variant (e.g. per-date):
        @cache_response("analytics_weekly", TTL_ANALYTICS_W,
                        variant_fn=lambda req: req.query_params.get("date", ""))
        def weekly_analytics(request): ...
    """
    def decorator(view_fn):
        @wraps(view_fn)
        def wrapper(request, *args, **kwargs):
            user_id = str(request.user.id)
            variant = variant_fn(request) if variant_fn else ""
            cached = CacheService.get(user_id, resource, variant)
            if cached is not None:
                from rest_framework.response import Response
                return Response(cached)
            response = view_fn(request, *args, **kwargs)
            if response.status_code == 200:
                CacheService.set(user_id, resource, response.data, ttl, variant)
            return response
        return wrapper
    return decorator
