"""
FORGE — Notifications App Views (Production)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.notifications.models import Notification
from apps.core.pagination import ForgeCursorPagination
from drf_spectacular.utils import extend_schema


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    GET /api/v1/notifications/
    Returns paginated notification list, newest first.
    """
    qs = Notification.objects.filter(user=request.user).order_by("-created_at")

    unread_only = request.query_params.get("unread_only") == "true"
    if unread_only:
        qs = qs.filter(is_read=False)

    paginator = ForgeCursorPagination()
    page = paginator.paginate_queryset(qs, request)

    data = [
        {
            "id": str(n.id),
            "title": n.title,
            "body": n.body,
            "type": n.notif_type,
            "is_read": n.is_read,
            "action_url": n.action_url,
            "created_at": n.created_at.isoformat(),
        }
        for n in page
    ]

    return paginator.get_paginated_response(data)


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """POST /api/v1/notifications/mark-all-read/"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"detail": "All notifications marked as read."})


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    """POST /api/v1/notifications/{id}/read/"""
    try:
        notif = Notification.objects.get(id=notification_id, user=request.user)
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"detail": "Notification marked as read."})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_count(request):
    """GET /api/v1/notifications/count/"""
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"unread_count": count})
