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
        from django.db.models import Count, Sum, Q, Value
        from django.db.models.functions import Coalesce

        qs = Routine.objects.filter(
            user=self.request.user, is_active=True, is_deleted=False
        ).select_related("user").annotate(
            annotated_task_count=Count(
                'tasks', 
                filter=Q(tasks__is_active=True)
            ),
            annotated_total_minutes=Coalesce(
                Sum(
                    'tasks__duration_minutes', 
                    filter=Q(tasks__is_active=True)
                ),
                Value(0)
            )
        ).prefetch_related("tasks", "schedule")
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
        from django.utils import timezone
        instance.is_deleted = True
        instance.is_active = False
        instance.deleted_at = timezone.now()
        instance.save(update_fields=["is_deleted", "is_active", "deleted_at", "updated_at"])
        CacheService.invalidate_today(str(self.request.user.id))

    @action(detail=True, methods=["post"], url_path="archive")
    def archive(self, request, pk=None):
        """POST /api/v1/routines/{id}/archive/"""
        routine = self.get_object()
        routine.is_active = False
        routine.save(update_fields=["is_active", "updated_at"])
        CacheService.invalidate_today(str(request.user.id))
        return Response({"detail": "Routine archived successfully."})

    @action(detail=True, methods=["post"], url_path="duplicate")
    def duplicate(self, request, pk=None):
        """POST /api/v1/routines/{id}/duplicate/"""
        routine = self.get_object()
        
        # Clone routine
        new_routine = Routine.objects.get(id=routine.id)
        new_routine.id = None
        new_routine.name = f"{routine.name} (Copy)"
        new_routine.save()

        # Clone schedule
        if hasattr(routine, 'schedule'):
            schedule = routine.schedule
            schedule.id = None
            schedule.routine = new_routine
            schedule.save()

        # Clone tasks
        for task in routine.tasks.filter(is_active=True):
            task.id = None
            task.routine = new_routine
            task.save()
            
        CacheService.invalidate_today(str(request.user.id))
        return Response(RoutineDetailSerializer(new_routine).data, status=status.HTTP_201_CREATED)

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
