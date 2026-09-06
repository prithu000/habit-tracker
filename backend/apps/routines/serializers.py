"""
YOU VS YOU — Tasks App Serializers
Flat Task CRUD — no more nested Routine structure.
"""
from rest_framework import serializers
from apps.routines.models import Task
from apps.core.validators import validate_task_name, validate_duration_minutes


class TaskSerializer(serializers.ModelSerializer):
    """Full read serializer for Task."""
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    frequency_display = serializers.CharField(source="get_frequency_display", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "name", "description",
            "category", "category_display",
            "frequency", "frequency_display",
            "due_date", "duration_minutes",
            "sort_order", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at", "category_display", "frequency_display"]

    def validate_name(self, value):
        validate_task_name(value)
        return value.strip()

    def validate_duration_minutes(self, value):
        if value is not None:
            validate_duration_minutes(value)
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    """Write serializer for POST /api/v1/tasks/."""

    class Meta:
        model = Task
        fields = ["name", "description", "category", "frequency", "due_date", "duration_minutes", "sort_order"]

    def validate_name(self, value):
        validate_task_name(value)
        return value.strip()

    def validate_duration_minutes(self, value):
        if value is not None:
            validate_duration_minutes(value)
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        # Auto-assign sort_order if 0 or missing
        if not validated_data.get("sort_order"):
            validated_data["sort_order"] = Task.objects.filter(user=user).count()
        return Task.objects.create(user=user, **validated_data)


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
