"""
FORGE — Routines App Views (Production)
Full CRUD with filtering, reordering, and soft-delete.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema

from apps.routines.models import Routine, Task, RoutineSchedule
from services.cache_service import CacheService
from apps.routines.serializers import (
    RoutineListSerializer,
    RoutineDetailSerializer,
    RoutineCreateSerializer,
    RoutineUpdateSerializer,
    TaskSerializer,
    TaskCreateSerializer,
    ReorderSerializer,
)
from apps.core.permissions import IsOwner
from apps.core.mixins import SoftDeleteMixin, UserScopedMixin
from apps.core.filters import RoutineFilter


class RoutineViewSet(UserScopedMixin, SoftDeleteMixin, viewsets.ModelViewSet):
    """
    Full CRUD for Routines.

    GET    /api/v1/routines/           — List all active routines
    POST   /api/v1/routines/           — Create routine (+schedule, +tasks)
    GET    /api/v1/routines/{id}/      — Routine detail with tasks
    PATCH  /api/v1/routines/{id}/      — Partial update
    DELETE /api/v1/routines/{id}/      — Soft delete (is_active=False)
    PATCH  /api/v1/routines/reorder/   — Bulk reorder
    """
    permission_classes = [IsAuthenticated, IsOwner]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RoutineFilter
    ordering_fields = ["sort_order", "name", "created_at"]
    ordering = ["sort_order"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Routine.objects.none()
        qs = Routine.objects.filter(
            user=self.request.user, is_active=True
        ).prefetch_related("tasks", "schedule").select_related("user")
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return RoutineListSerializer
        if self.action in ("create",):
            return RoutineCreateSerializer
        if self.action in ("update", "partial_update"):
            return RoutineUpdateSerializer
        return RoutineDetailSerializer

    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsOwner()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()
        CacheService.invalidate_today(str(self.request.user.id))

    def perform_update(self, serializer):
        serializer.save()
        CacheService.invalidate_today(str(self.request.user.id))

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        CacheService.invalidate_today(str(self.request.user.id))

    @action(detail=False, methods=["patch"], url_path="reorder")
    def reorder(self, request):
        """PATCH /api/v1/routines/reorder/"""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for item in serializer.validated_data["items"]:
            Routine.objects.filter(
                id=item["id"], user=request.user
            ).update(sort_order=item["sort_order"])
        CacheService.invalidate_today(str(request.user.id))
        return Response({"detail": "Routines reordered successfully."})

    # ──────────────── Task sub-actions ────────────────

    @action(detail=True, methods=["get", "post"], url_path="tasks")
    def tasks(self, request, pk=None):
        """
        GET  /api/v1/routines/{id}/tasks/  — List tasks
        POST /api/v1/routines/{id}/tasks/  — Add task
        """
        routine = self.get_object()

        if request.method == "GET":
            tasks = routine.tasks.filter(is_active=True).order_by("sort_order")
            return Response(TaskSerializer(tasks, many=True).data)

        serializer = TaskCreateSerializer(
            data=request.data,
            context={"routine": routine},
        )
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        CacheService.invalidate_today(str(request.user.id))
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="tasks/reorder")
    def reorder_tasks(self, request, pk=None):
        """PATCH /api/v1/routines/{id}/tasks/reorder/"""
        routine = self.get_object()
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for item in serializer.validated_data["items"]:
            Task.objects.filter(id=item["id"], routine=routine).update(
                sort_order=item["sort_order"]
            )
        CacheService.invalidate_today(str(request.user.id))
        return Response({"detail": "Tasks reordered successfully."})

    @extend_schema(methods=["get"], operation_id="routines_task_detail_retrieve")
    @action(
        detail=True,
        methods=["get", "patch", "delete"],
        url_path=r"tasks/(?P<task_id>[0-9a-f-]{36})",
    )
    def task_detail(self, request, pk=None, task_id=None):
        """
        GET    /api/v1/routines/{id}/tasks/{task_id}/
        PATCH  /api/v1/routines/{id}/tasks/{task_id}/
        DELETE /api/v1/routines/{id}/tasks/{task_id}/
        """
        routine = self.get_object()
        task = get_object_or_404(Task, id=task_id, routine=routine)

        if request.method == "GET":
            return Response(TaskSerializer(task).data)

        if request.method == "DELETE":
            task.is_active = False
            task.save(update_fields=["is_active", "updated_at"])
            CacheService.invalidate_today(str(request.user.id))
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        CacheService.invalidate_today(str(request.user.id))
        return Response(serializer.data)
