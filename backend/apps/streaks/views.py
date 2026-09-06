from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.streaks.models import StreakRecord
from drf_spectacular.utils import extend_schema


def serialize_streak(record):
    return {
        "current_streak": record.current_streak,
        "longest_streak": record.longest_streak,
        "last_completed_date": record.last_completed_date.isoformat() if record.last_completed_date else None,
        "grace_period_used": record.grace_period_used,
    }


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def streaks_view(request):
    """GET /api/v1/streaks/ — returns the overall user streak."""
    record = StreakRecord.objects.filter(user=request.user).first()
    if not record:
        return Response({"current_streak": 0, "longest_streak": 0,
                         "last_completed_date": None, "grace_period_used": False})
    return Response(serialize_streak(record))
