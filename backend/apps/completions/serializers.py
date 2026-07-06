"""
FORGE — Completions Serializers (Production)
"""
from rest_framework import serializers
from apps.completions.models import Completion, DayLog
from apps.core.validators import validate_mood_score


class CompleteTaskSerializer(serializers.Serializer):
    """Input serializer for POST /today/complete/"""
    task_id = serializers.UUIDField()
    note = serializers.CharField(max_length=500, required=False, default="", allow_blank=True)
    mood = serializers.IntegerField(min_value=1, max_value=5, required=False, allow_null=True)
    duration_actual = serializers.IntegerField(min_value=1, max_value=1440, required=False, allow_null=True)

    def validate_mood(self, value):
        if value is not None:
            validate_mood_score(value)
        return value


class CompletionSerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source="task.name", read_only=True)
    routine_id = serializers.UUIDField(source="task.routine_id", read_only=True)
    routine_name = serializers.CharField(source="task.routine.name", read_only=True)

    class Meta:
        model = Completion
        fields = [
            "id", "task_id", "task_name", "routine_id", "routine_name",
            "completed_at", "local_date", "note", "mood", "duration_actual",
        ]
        read_only_fields = ["id", "completed_at", "local_date"]


class CompleteTaskResponseSerializer(serializers.Serializer):
    completion_id = serializers.UUIDField()
    xp_earned = serializers.IntegerField()
    total_xp = serializers.IntegerField()
    current_level = serializers.IntegerField()
    leveled_up = serializers.BooleanField()
    level_progress = serializers.FloatField()
    streak_milestone = serializers.IntegerField(allow_null=True)
    current_streak = serializers.IntegerField()
    is_perfect_day = serializers.BooleanField()
    perfect_day_bonus_xp = serializers.IntegerField()
    new_badges = serializers.ListField(child=serializers.DictField(), default=list)


class DayLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayLog
        fields = [
            "id", "log_date", "tasks_scheduled", "tasks_completed",
            "completion_rate", "xp_earned", "routines_completed", "is_streak_day",
        ]
        read_only_fields = fields


class TodayTaskSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField()
    duration_minutes = serializers.IntegerField(allow_null=True)
    sort_order = serializers.IntegerField()
    is_completed = serializers.BooleanField()
    completed_at = serializers.DateTimeField(allow_null=True)
    note = serializers.CharField()
    mood = serializers.IntegerField(allow_null=True)
    completion_id = serializers.UUIDField(allow_null=True)


class TodayRoutineSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    icon = serializers.CharField()
    color = serializers.CharField()
    time_of_day = serializers.CharField()
    sort_order = serializers.IntegerField()
    is_complete = serializers.BooleanField()
    task_count = serializers.IntegerField()
    completed_count = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    tasks = TodayTaskSerializer(many=True)


class TodayStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    is_perfect_day = serializers.BooleanField()
    xp_earned_today = serializers.IntegerField()
    current_streak = serializers.IntegerField()


class TodayResponseSerializer(serializers.Serializer):
    date = serializers.DateField()
    stats = TodayStatsSerializer()
    routines = TodayRoutineSerializer(many=True)
