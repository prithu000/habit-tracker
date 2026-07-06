"""
FORGE Personal Operating System — Additive API Routing
Clean additive endpoints for all 23 flagship OS features without touching existing routes.
"""
from django.urls import path
from apps.analytics import os_views as analytics_os
from apps.rewards import os_views as rewards_os
from apps.notifications import os_views as notif_os

urlpatterns = [
    # Analytics & POS
    path("life-score/", analytics_os.life_score_view, name="os-life-score"),
    path("analytics/motivation/", analytics_os.motivation_view, name="os-motivation"),
    path("analytics/reports/", analytics_os.smart_reports_view, name="os-reports"),
    path("analytics/timeline/", analytics_os.timeline_view, name="os-timeline"),
    path("analytics/goals/", analytics_os.goals_view, name="os-goals"),
    path("analytics/metrics/", analytics_os.metrics_view, name="os-metrics"),

    # Rewards, Coins, Store, Leagues, Achievements, Freezes
    path("rewards/coins/", rewards_os.coins_view, name="os-coins"),
    path("rewards/store/", rewards_os.store_view, name="os-store"),
    path("rewards/leagues/", rewards_os.leagues_view, name="os-leagues"),
    path("rewards/achievements-list/", rewards_os.hardcore_achievements_view, name="os-achievements-list"),
    path("streaks/freeze/", rewards_os.streak_freeze_view, name="os-streak-freeze"),

    # Support, Pomodoro Emails, Email Reminders
    path("notifications/support/", notif_os.support_report_view, name="os-support-report"),
    path("notifications/pomodoro-email/", notif_os.pomodoro_email_view, name="os-pomodoro-email"),
    path("notifications/reminders/", notif_os.email_reminders_view, name="os-reminders"),
]
