import logging
from celery import shared_task
from django.utils import timezone
from zoneinfo import ZoneInfo
from django.contrib.auth import get_user_model
from datetime import timedelta
import uuid

from .services import EmailService

logger = logging.getLogger(__name__)
User = get_user_model()

def get_timezones_for_hour(target_hour: int) -> list:
    """Returns a list of timezone names where the current local time hour matches target_hour."""
    now_utc = timezone.now()
    matching_tzs = []
    unique_tzs = User.objects.values_list('timezone', flat=True).distinct()
    for tz_name in unique_tzs:
        if not tz_name: continue
        try:
            local_time = now_utc.astimezone(ZoneInfo(tz_name))
            if local_time.hour == target_hour:
                matching_tzs.append(tz_name)
        except Exception:
            continue
    return matching_tzs

# =====================================================
# DAILY SCHEDULES
# =====================================================

@shared_task(name="apps.emails.scheduler.schedule_morning_motivation")
def schedule_morning_motivation():
    """Runs hourly. Finds users at 7 AM local time."""
    from apps.streaks.models import StreakRecord
    from apps.completions.models import DayLog
    from .core.ai_engine import AIEmailEngine
    
    tzs = get_timezones_for_hour(7)
    if not tzs: return

    users = User.objects.filter(timezone__in=tzs, is_active=True)
    date_str = timezone.now().strftime('%Y-%m-%d')
    yesterday = (timezone.now() - timedelta(days=1)).date()

    for user in users:
        # Collect telemetry for AI Engine
        overall_streak = StreakRecord.objects.filter(user=user, routine__isnull=True).first()
        streak_count = overall_streak.current_streak if overall_streak else 0
        
        yesterday_log = DayLog.objects.filter(user=user, log_date=yesterday).first()
        missed_yesterday = False
        if yesterday_log and yesterday_log.tasks_scheduled > 0 and yesterday_log.completion_rate < 100:
            missed_yesterday = True
            
        ai_data = AIEmailEngine.generate_daily_motivation({
            "name": user.display_name or "User",
            "streak": streak_count,
            "xp": user.total_xp,
            "missed_yesterday": missed_yesterday
        })

        key = f"morning_{user.id}_{date_str}"
        context = {
            "user_name": user.display_name or "User",
            "current_streak": streak_count,
            "total_xp": user.total_xp,
            "arena_rank": f"Level {user.current_level}",
            "quote": ai_data["quote"],
            "app_url": getattr(settings, "FRONTEND_URL", "https://youvsyou.site"),
        }
        EmailService.send_email_async(
            recipient=user.email,
            subject=ai_data["subject"],
            template_name="daily_morning",
            context=context,
            idempotency_key=key,
            segment="daily_morning"
        )


@shared_task(name="apps.emails.scheduler.schedule_evening_reflection")
def schedule_evening_reflection():
    """Runs hourly. Finds users at 10 PM local time."""
    tzs = get_timezones_for_hour(22)
    if not tzs: return

    users = User.objects.filter(timezone__in=tzs, is_active=True)
    date_str = timezone.now().strftime('%Y-%m-%d')

    for user in users:
        key = f"night_{user.id}_{date_str}"
        context = {
            "user_name": user.display_name or "User",
            "completed_tasks": 5,
            "missed_tasks": 0,
            "completion_percent": 100,
            "xp_earned": 100,
            "app_url": "https://youvsyou.site",
            "settings_url": "https://youvsyou.site/settings",
            "unsubscribe_url": "https://youvsyou.site/unsubscribe"
        }
        EmailService.send_email_async(
            recipient=user.email,
            subject="Night Review",
            template_name="daily_night",
            context=context,
            idempotency_key=key
        )


@shared_task(name="apps.emails.scheduler.schedule_inactive_reminders")
def schedule_inactive_reminders():
    """Runs daily at midnight UTC to trigger retention drips."""
    from apps.streaks.models import StreakRecord
    now = timezone.now()
    
    drip_config = {
        1: {"template": "retention/missed_1_day", "subject": "We noticed you missed today."},
        2: {"template": "retention/missed_2_days", "subject": "Your future self is waiting."},
        3: {"template": "retention/missed_3_days", "subject": "Return to the Arena."},
        5: {"template": "retention/missed_5_days", "subject": "Your streak can still be rebuilt."},
        7: {"template": "retention/missed_7_days", "subject": "Don't let your identity disappear."},
        14: {"template": "retention/missed_14_days", "subject": "You started for a reason."},
        30: {"template": "retention/missed_30_days", "subject": "Come back. Start again."}
    }
    
    for days, config in drip_config.items():
        # Using date_joined or last_login based on system architecture. Assuming last_login for inactivity.
        target_date = (now - timedelta(days=days)).date()
        users = User.objects.filter(last_login__date=target_date, is_active=True)
        
        for user in users:
            # Query their highest streak for personalization and "loss aversion"
            overall_streak = StreakRecord.objects.filter(user=user, routine__isnull=True).first()
            longest = overall_streak.longest_streak if overall_streak else 0
            
            key = f"inactive_{days}_{user.id}_{target_date}"
            context = {
                "user_name": user.display_name or "User",
                "days_missed": days,
                "longest_streak": longest,
                "app_url": getattr(settings, "FRONTEND_URL", "https://youvsyou.site"),
            }
            
            EmailService.send_email_async(
                recipient=user.email,
                subject=config["subject"],
                template_name=config["template"],
                context=context,
                idempotency_key=key,
                segment=f"missed_{days}_days"
            )
