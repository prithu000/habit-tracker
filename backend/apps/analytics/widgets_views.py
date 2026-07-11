from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.core.utils import get_user_local_date
from apps.analytics.models import CustomWidget, WidgetLog, ReportSettings
from services.cache_service import CacheService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def custom_widgets_list_view(request):
    """
    GET: List all user widgets and today's progress.
    POST: Create a new custom widget.
    """
    user = request.user
    local_date = get_user_local_date(user)

    if request.method == "POST":
        data = request.data
        widget = CustomWidget.objects.create(
            user=user,
            name=data.get("name", "New Widget"),
            goal=int(data.get("goal", 10)),
            unit=data.get("unit", "units"),
            icon=data.get("icon", "check"),
            color=data.get("color", "blue"),
            step_size=int(data.get("step_size", 1)),
            reset_daily=data.get("reset_daily", True),
            show_on_dashboard=data.get("show_on_dashboard", True),
            is_active=data.get("is_active", True)
        )
        CacheService.invalidate_all(str(user.id))
        return Response({"id": widget.id, "message": "Widget created"})

    # GET
    widgets = CustomWidget.objects.filter(user=user, is_active=True).order_by("created_at")
    
    # Pre-fetch today's logs
    logs = WidgetLog.objects.filter(widget__user=user, date=local_date)
    logs_map = {log.widget_id: log.progress for log in logs}

    response_data = []
    for w in widgets:
        response_data.append({
            "id": w.id,
            "name": w.name,
            "goal": w.goal,
            "unit": w.unit,
            "icon": w.icon,
            "color": w.color,
            "step_size": w.step_size,
            "reset_daily": w.reset_daily,
            "show_on_dashboard": w.show_on_dashboard,
            "progress": logs_map.get(w.id, 0),
            "is_active": w.is_active
        })

    return Response(response_data)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def custom_widget_detail_view(request, pk):
    """
    PATCH: Update widget settings
    DELETE: Soft delete or hard delete widget
    """
    user = request.user
    widget = get_object_or_404(CustomWidget, id=pk, user=user)

    if request.method == "DELETE":
        widget.is_active = False
        widget.save()
        settings = ReportSettings.objects.filter(user=user).first()
        if settings and settings.selected_habit_breakdown:
            w_id_str = str(widget.id)
            if w_id_str in [str(sid) for sid in settings.selected_habit_breakdown]:
                settings.selected_habit_breakdown = [
                    str(sid) for sid in settings.selected_habit_breakdown
                    if str(sid) != w_id_str
                ]
                settings.save()
        CacheService.invalidate_all(str(user.id))
        return Response({"message": "Widget archived"})

    # PATCH
    data = request.data

    fields = ["name", "goal", "unit", "icon", "color", "step_size", 
              "reset_daily", "show_on_dashboard", "is_active"]
    
    for field in fields:
        if field in data:
            val = data[field]
            if field in ["goal", "step_size"]:
                val = int(val)
            elif field in ["reset_daily", "show_on_dashboard", "is_active"]:
                val = bool(val)
            setattr(widget, field, val)
    
    widget.save()
    CacheService.invalidate_all(str(user.id))
    return Response({"message": "Widget updated"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def custom_widget_log_view(request, pk):
    """
    POST: Update today's progress for a widget.
    Body: {"progress": 15}
    """
    user = request.user
    local_date = get_user_local_date(user)
    widget = get_object_or_404(CustomWidget, id=pk, user=user)

    from django.utils import timezone

    progress = int(request.data.get("progress", 0))
    is_completed = progress >= widget.goal
    
    log, created = WidgetLog.objects.get_or_create(
        widget=widget, 
        date=local_date,
        defaults={
            "progress": progress,
            "completed_at": timezone.now() if is_completed else None
        }
    )
    
    if not created:
        log.progress = progress
        if is_completed and not log.completed_at:
            log.completed_at = timezone.now()
        elif not is_completed:
            log.completed_at = None
        log.save()

    CacheService.invalidate_all(str(user.id))
    return Response({"id": widget.id, "date": local_date.isoformat(), "progress": log.progress})

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def report_settings_view(request):
    """
    GET: Retrieve user's report settings (which widgets to show).
    PUT/PATCH: Update the selected widgets.
    """
    user = request.user
    settings, _ = ReportSettings.objects.get_or_create(user=user)

    if request.method in ["PUT", "PATCH"]:
        data = request.data
        if "selected_widget_ids" in data:
            selected = data["selected_widget_ids"]
        elif "selected_habit_breakdown" in data:
            selected = data["selected_habit_breakdown"]
        else:
            selected = None
            
        if selected is not None:
            if not isinstance(selected, list):
                return Response({"error": "selected_widget_ids must be a list"}, status=400)
            if len(selected) > 4:
                return Response({"error": "Maximum 4 habits can be selected"}, status=400)
            
            # Save the raw string IDs sent from frontend directly, just filter out invalid ones
            str_ids = [str(sid) for sid in selected]
            valid_qs = CustomWidget.objects.filter(id__in=str_ids, user=user, is_active=True).values_list("id", flat=True)
            valid_id_strs = [str(vid) for vid in valid_qs]
            
            ordered_valid = [sid for sid in str_ids if sid in valid_id_strs]
            
            settings.selected_habit_breakdown = ordered_valid
            settings.save()
            CacheService.invalidate_all(str(user.id))
            
            return Response({
                "message": "Report settings updated",
                "selected_widget_ids": settings.selected_habit_breakdown
            })
        return Response({"error": "Missing selected_widget_ids"}, status=400)

    # GET request
    raw_ids = settings.selected_habit_breakdown or []
    str_ids = [str(sid) for sid in raw_ids]
    
    # We will just validate that they still exist and are active
    valid_qs = CustomWidget.objects.filter(id__in=str_ids, user=user, is_active=True).values_list("id", flat=True)
    valid_id_strs = [str(vid) for vid in valid_qs]
    
    ordered_valid = [sid for sid in str_ids if sid in valid_id_strs]
    
    # Do NOT auto-save on GET, it can cause race conditions or empty out settings if DB is temporarily disconnected
    return Response({
        "selected_widget_ids": ordered_valid
    })
