"""
FORGE — Core Mixins
ViewSet and view mixins for clean, reusable behavior.
"""
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
import hashlib
import json


class UserScopedMixin:
    """
    Automatically scopes querysets to the requesting user.
    Requires the model to have a `user` FK.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class CachedResponseMixin:
    """
    Caches GET responses in Redis.
    Override `get_cache_key(request)` for custom keys.
    Cache TTL: 60 seconds by default (override `cache_ttl`).
    """
    cache_ttl = 60

    def get_cache_key(self, request) -> str:
        path = request.get_full_path()
        user_id = str(request.user.id)
        raw = f"{user_id}:{path}"
        return hashlib.md5(raw.encode()).hexdigest()

    def retrieve(self, request, *args, **kwargs):
        key = self.get_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(json.loads(cached))
        response = super().retrieve(request, *args, **kwargs)
        cache.set(key, json.dumps(response.data), self.cache_ttl)
        return response

    def invalidate_cache(self, request):
        key = self.get_cache_key(request)
        cache.delete(key)


class BulkUpdateMixin:
    """
    Provides a `bulk_update` action for reordering lists.
    Expects: [{ "id": uuid, "sort_order": int }, ...]
    """
    bulk_update_serializer_class = None

    def perform_bulk_update(self, model_class, validated_items, user):
        for item in validated_items:
            model_class.objects.filter(
                id=item["id"], user=user
            ).update(sort_order=item["sort_order"])


class SoftDeleteMixin:
    """
    Overrides destroy() to set is_active=False instead of deleting.
    """
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TimestampFilterMixin:
    """
    Adds `created_after` and `created_before` query param filtering.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        created_after = self.request.query_params.get("created_after")
        created_before = self.request.query_params.get("created_before")
        if created_after:
            qs = qs.filter(created_at__date__gte=created_after)
        if created_before:
            qs = qs.filter(created_at__date__lte=created_before)
        return qs
