"""
FORGE — Routines App Serializers (Production)
"""
from rest_framework import serializers
from apps.routines.models import Routine, Task, RoutineSchedule
from apps.core.validators import (
    validate_hex_color, validate_emoji,
    validate_routine_name, validate_task_name,
    validate_duration_minutes, validate_days_of_week,
)


# ─────────────────────────────────────────────────────────
# Task
# ─────────────────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id", "name", "description", "duration_minutes",
            "sort_order", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        validate_task_name(value)
        return value.strip()

    def validate_duration_minutes(self, value):
        if value is not None:
            validate_duration_minutes(value)
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["name", "description", "duration_minutes", "sort_order"]

    def validate_name(self, value):
        validate_task_name(value)
        return value.strip()

    def validate_duration_minutes(self, value):
        if value is not None:
            validate_duration_minutes(value)
        return value

    def create(self, validated_data):
        routine = self.context["routine"]
        # Auto-assign sort_order if not provided
        if "sort_order" not in validated_data or validated_data["sort_order"] == 0:
            max_order = Task.objects.filter(routine=routine).count()
            validated_data["sort_order"] = max_order
        return Task.objects.create(routine=routine, **validated_data)


# ─────────────────────────────────────────────────────────
# Schedule
# ─────────────────────────────────────────────────────────

class RoutineScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineSchedule
        fields = ["recurrence_type", "days_of_week", "start_date", "end_date"]

    def validate_days_of_week(self, value):
        validate_days_of_week(value)
        return value

    def validate(self, attrs):
        recurrence = attrs.get("recurrence_type", "daily")
        days = attrs.get("days_of_week", [])
        if recurrence == RoutineSchedule.RecurrenceType.WEEKLY and not days:
            raise serializers.ValidationError(
                {"days_of_week": "At least one day must be selected for weekly routines."}
            )
        return attrs


class RoutineScheduleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineSchedule
        fields = ["recurrence_type", "days_of_week", "end_date"]

    def validate_days_of_week(self, value):
        validate_days_of_week(value)
        return value


# ─────────────────────────────────────────────────────────
# Routine
# ─────────────────────────────────────────────────────────

class RoutineListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    task_count = serializers.IntegerField(source="active_task_count", read_only=True)
    estimated_minutes = serializers.IntegerField(source="estimated_total_minutes", read_only=True)
    schedule = RoutineScheduleSerializer(read_only=True)

    class Meta:
        model = Routine
        fields = [
            "id", "name", "description", "icon", "color",
            "time_of_day", "is_active", "sort_order",
            "task_count", "estimated_minutes", "schedule",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RoutineDetailSerializer(serializers.ModelSerializer):
    """Full serializer including tasks."""
    tasks = TaskSerializer(many=True, read_only=True)
    schedule = RoutineScheduleSerializer(read_only=True)
    task_count = serializers.IntegerField(source="active_task_count", read_only=True)
    estimated_minutes = serializers.IntegerField(source="estimated_total_minutes", read_only=True)

    class Meta:
        model = Routine
        fields = [
            "id", "name", "description", "icon", "color",
            "time_of_day", "is_active", "sort_order",
            "tasks", "schedule", "task_count", "estimated_minutes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RoutineCreateSerializer(serializers.ModelSerializer):
    schedule = RoutineScheduleSerializer(required=False)
    initial_tasks = TaskCreateSerializer(many=True, required=False)

    class Meta:
        model = Routine
        fields = [
            "id", "name", "description", "icon", "color",
            "time_of_day", "sort_order", "schedule", "initial_tasks",
        ]
        read_only_fields = ["id"]

    def validate_name(self, value):
        validate_routine_name(value)
        return value.strip()

    def validate_icon(self, value):
        validate_emoji(value)
        return value

    def validate_color(self, value):
        validate_hex_color(value)
        return value

    def create(self, validated_data):
        schedule_data = validated_data.pop("schedule", None)
        tasks_data = validated_data.pop("initial_tasks", [])
        user = self.context["request"].user

        routine = Routine.objects.create(user=user, **validated_data)

        # Create schedule
        if schedule_data:
            RoutineSchedule.objects.create(routine=routine, **schedule_data)
        else:
            RoutineSchedule.objects.create(routine=routine)  # Default daily

        # Create initial tasks
        for i, task_data in enumerate(tasks_data):
            task_data.setdefault("sort_order", i)
            Task.objects.create(routine=routine, **task_data)

        return routine


class RoutineUpdateSerializer(serializers.ModelSerializer):
    schedule = RoutineScheduleUpdateSerializer(required=False)

    class Meta:
        model = Routine
        fields = [
            "name", "description", "icon", "color",
            "time_of_day", "is_active", "sort_order", "schedule",
        ]

    def validate_name(self, value):
        validate_routine_name(value)
        return value.strip()

    def validate_icon(self, value):
        validate_emoji(value)
        return value

    def validate_color(self, value):
        validate_hex_color(value)
        return value

    def update(self, instance, validated_data):
        schedule_data = validated_data.pop("schedule", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if schedule_data:
            schedule, _ = RoutineSchedule.objects.get_or_create(routine=instance)
            for attr, value in schedule_data.items():
                setattr(schedule, attr, value)
            schedule.save()

        return instance


# ─────────────────────────────────────────────────────────
# Reorder
# ─────────────────────────────────────────────────────────

class ReorderItemSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    sort_order = serializers.IntegerField(min_value=0)


class ReorderSerializer(serializers.Serializer):
    items = ReorderItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Reorder list cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError("Cannot reorder more than 100 items at once.")
        return value
