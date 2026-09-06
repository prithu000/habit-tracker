"""
YOU VS YOU — Tasks App Views
Flat Task CRUD at /api/v1/tasks/.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema

from apps.routines.models import Task
from apps.routines.serializers import TaskSerializer, TaskCreateSerializer, ReorderSerializer
from apps.core.permissions import IsOwner
from apps.core.mixins import SoftDeleteMixin, UserScopedMixin
from apps.core.filters import TaskFilter
from services.cache_service import CacheService


class TaskViewSet(UserScopedMixin, SoftDeleteMixin, viewsets.ModelViewSet):
    """
    Flat Task CRUD.

    GET    /api/v1/tasks/              — List all active tasks
    POST   /api/v1/tasks/              — Create task
    GET    /api/v1/tasks/{id}/         — Task detail
    PATCH  /api/v1/tasks/{id}/         — Partial update
    DELETE /api/v1/tasks/{id}/         — Soft delete (is_active=False)
    PATCH  /api/v1/tasks/reorder/      — Bulk reorder

    Filters: ?category=fitness  ?frequency=daily  ?is_active=true
    """
    permission_classes = [IsAuthenticated, IsOwner]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = TaskFilter
    ordering_fields = ["sort_order", "name", "category", "created_at"]
    ordering = ["sort_order"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Task.objects.none()
        return Task.objects.filter(
            user=self.request.user, is_active=True
        ).only(
            "id", "name", "description", "category", "frequency",
            "due_date", "duration_minutes", "sort_order", "is_active", "created_at",
        ).order_by("sort_order")

    def get_serializer_class(self):
        if self.action == "create":
            return TaskCreateSerializer
        return TaskSerializer

    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsOwner()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()
        CacheService.invalidate_all(str(self.request.user.id))

    def perform_update(self, serializer):
        serializer.save()
        CacheService.invalidate_all(str(self.request.user.id))

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        CacheService.invalidate_all(str(self.request.user.id))

    @action(detail=False, methods=["patch"], url_path="reorder")
    def reorder(self, request):
        """PATCH /api/v1/tasks/reorder/"""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for item in serializer.validated_data["items"]:
            Task.objects.filter(
                id=item["id"], user=request.user
            ).update(sort_order=item["sort_order"])
        CacheService.invalidate_all(str(request.user.id))
        return Response({"detail": "Tasks reordered successfully."})
