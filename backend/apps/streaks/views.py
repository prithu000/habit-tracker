from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.streaks.models import StreakRecord
from apps.routines.models import Routine
from drf_spectacular.utils import extend_schema


def serialize_streak(record):
    return {
        "routine_id": str(record.routine_id) if record.routine_id else None,
        "routine_name": record.routine.name if record.routine else "Overall",
        "current_streak": record.current_streak,
        "longest_streak": record.longest_streak,
        "last_completed_date": record.last_completed_date.isoformat() if record.last_completed_date else None,
        "grace_period_used": record.grace_period_used,
    }


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def streaks_view(request):
    records = StreakRecord.objects.filter(user=request.user).select_related("routine")
    return Response([serialize_streak(r) for r in records])


@extend_schema(operation_id="streaks_routine_detail", responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def routine_streak_view(request, routine_id):
    routine = get_object_or_404(Routine, id=routine_id, user=request.user)
    record = StreakRecord.objects.filter(user=request.user, routine=routine).first()
    if not record:
        return Response({"current_streak": 0, "longest_streak": 0})
    return Response(serialize_streak(record))
