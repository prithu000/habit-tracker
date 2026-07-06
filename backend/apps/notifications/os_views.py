"""
FORGE Personal Operating System — Notifications & Support POS Views
Help Center bug reporting, Pomodoro email alerts, and scheduled email reminders.
"""
import uuid
from datetime import datetime
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.notifications.models import EmailReminderSchedule
from workers.tasks.os_tasks import report_issue_task, send_pomodoro_email_task


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def support_report_view(request):
    """
    POST /api/v1/notifications/support/
    Submits Help Center bug report, feature request, or feedback to rahul.business940@gmail.com.
    """
    user = request.user
    data = request.data
    issue_type = data.get("issue_type", "bug")
    title = data.get("title", "No Title Provided")
    description = data.get("description", "")
    browser = data.get("browser", "Unknown Browser")
    version = data.get("version", "YOU VS YOU OS v2.5")
    logs = data.get("logs", "No system logs attached.")

    if not description:
        return Response({"error": "Description is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Dispatch Celery background task
    report_issue_task.delay(
        user_email=user.email,
        issue_type=issue_type,
        title=title,
        description=description,
        browser=browser,
        version=version,
        logs=logs
    )

    return Response({
        "message": f"Successfully submitted {issue_type.title()} to YOU VS YOU Engineering team! We will investigate immediately."
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pomodoro_email_view(request):
    """
    POST /api/v1/notifications/pomodoro-email/
    Triggers start or end Pomodoro email alerts.
    """
    user = request.user
    data = request.data
    task_name = data.get("task_name", "Focus Session")
    start_time = data.get("start_time", "Now")
    end_time = data.get("end_time", "In 25 minutes")
    duration_mins = int(data.get("duration_mins", 25))
    xp_earned = int(data.get("xp_earned", 50))
    current_streak = int(data.get("current_streak", 1))
    event_type = data.get("event_type", "start")  # start or end

    send_pomodoro_email_task.delay(
        user_email=user.email,
        task_name=task_name,
        start_time=start_time,
        end_time=end_time,
        duration_mins=duration_mins,
        xp_earned=xp_earned,
        current_streak=current_streak,
        event_type=event_type
    )

    return Response({"message": f"Pomodoro {event_type} email alert dispatched."})


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def email_reminders_view(request):
    """
    GET/POST/DELETE /api/v1/notifications/reminders/
    Manage scheduled email reminders with 1-click completion token.
    """
    user = request.user

    if request.method == "POST":
        data = request.data
        task_name = data.get("task_name")
        deadline_str = data.get("deadline")
        priority = data.get("priority", "Medium")
        frequency = data.get("frequency", "Daily")

        if not task_name or not deadline_str:
            return Response({"error": "task_name and deadline are required."}, status=status.HTTP_400_BAD_REQUEST)

        deadline = parse_datetime(deadline_str)
        if not deadline:
            return Response({"error": "Invalid deadline format. Use ISO format."}, status=status.HTTP_400_BAD_REQUEST)

        reminder = EmailReminderSchedule.objects.create(
            user=user,
            task_name=task_name,
            deadline=deadline,
            priority=priority,
            frequency=frequency,
            completion_token=uuid.uuid4()
        )
        return Response({
            "message": "Scheduled email reminder created successfully!",
            "reminder": {
                "id": str(reminder.id),
                "task_name": reminder.task_name,
                "deadline": reminder.deadline.isoformat(),
                "priority": reminder.priority,
                "frequency": reminder.frequency,
                "is_active": reminder.is_active
            }
        }, status=status.HTTP_201_CREATED)

    if request.method == "DELETE":
        reminder_id = request.query_params.get("id")
        EmailReminderSchedule.objects.filter(user=user, id=reminder_id).delete()
        return Response({"message": "Reminder deleted."})

    reminders = EmailReminderSchedule.objects.filter(user=user, is_active=True).order_by("deadline")
    data = [
        {
            "id": str(r.id),
            "task_name": r.task_name,
            "deadline": r.deadline.isoformat(),
            "priority": r.priority,
            "frequency": r.frequency,
            "is_active": r.is_active
        }
        for r in reminders
    ]
    return Response({"reminders": data})
