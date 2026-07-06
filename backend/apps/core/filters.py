"""
FORGE — django-filter FilterSets
One FilterSet per major resource.
"""
import django_filters
from django_filters import rest_framework as filters
from apps.routines.models import Routine, Task
from apps.completions.models import Completion, DayLog


class RoutineFilter(filters.FilterSet):
    time_of_day = filters.CharFilter(field_name="time_of_day", lookup_expr="exact")
    is_active = filters.BooleanFilter(field_name="is_active")
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Routine
        fields = ["time_of_day", "is_active", "name"]


class TaskFilter(filters.FilterSet):
    routine = filters.UUIDFilter(field_name="routine__id")
    is_active = filters.BooleanFilter(field_name="is_active")
    name = filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Task
        fields = ["routine", "is_active", "name"]


class CompletionFilter(filters.FilterSet):
    date_from = filters.DateFilter(field_name="local_date", lookup_expr="gte")
    date_to = filters.DateFilter(field_name="local_date", lookup_expr="lte")
    task = filters.UUIDFilter(field_name="task__id")
    mood = filters.NumberFilter(field_name="mood")

    class Meta:
        model = Completion
        fields = ["date_from", "date_to", "task", "mood"]


class DayLogFilter(filters.FilterSet):
    date_from = filters.DateFilter(field_name="log_date", lookup_expr="gte")
    date_to = filters.DateFilter(field_name="log_date", lookup_expr="lte")
    min_rate = filters.NumberFilter(field_name="completion_rate", lookup_expr="gte")

    class Meta:
        model = DayLog
        fields = ["date_from", "date_to", "min_rate"]
