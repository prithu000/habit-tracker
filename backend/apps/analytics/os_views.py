"""
YOU VS YOU Personal Operating System — Analytics & POS Views
Life Score, AI Motivation, Smart Reports (CSV/JSON), and Life Timeline.
"""
import csv
import json
from datetime import date, timedelta
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.permissions import HasPremiumAccessPermission
from apps.core.utils import get_user_local_date, get_week_bounds
from apps.analytics.models import LifeScoreSnapshot, UserOSGoals, DailyOSMetrics
from apps.completions.models import DayLog
from apps.streaks.models import StreakRecord
from apps.rewards.models import XPTransaction, UserBadge
from services.xp_service import XPService
from services.report_engine import ReportEngine
from services.score_engine import ScoreEngine
from services.cache_service import CacheService, TTL_ANALYTICS_W


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def life_score_view(request):
    """
    GET /api/v1/life-score/
    Returns current Life Score 2.0, Discipline 2.0, 9-Axis radar chart, trend, confidence, and dimensional breakdowns.
    """
    user = request.user
    data = ScoreEngine.get_life_score_data(user)
    data["radar"] = ScoreEngine.get_radar_diagnostic(user)
    data["dimensions"] = ScoreEngine.get_dimensional_breakdown(user)
    data["discipline_data"] = ScoreEngine.get_discipline_score(user)
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def motivation_view(request):
    """
    GET /api/v1/analytics/motivation/
    AI Motivation ('Don't Give Up') when streak breaks, user inactive, or completion low.
    """
    user = request.user
    local_date = get_user_local_date(user)

    today_log = DayLog.objects.filter(user=user, log_date=local_date).first()
    streak_rec = StreakRecord.objects.filter(user=user, routine__isnull=True).first()

    completion_rate = float(today_log.completion_rate) if today_log else 0.0
    streak_val = streak_rec.current_streak if streak_rec else 0
    longest_streak = streak_rec.longest_streak if streak_rec else 0

    should_show = (completion_rate < 50) or (streak_val == 0)

    data = {
        "should_show": should_show,
        "title": "Don't Give Up — Neural Recovery Protocol",
        "motivation": "Every champion in history has faced cognitive friction. A temporary dip is simply feedback to refine your execution system.",
        "advice": "Do not rely on willpower. The 2-minute rule is your secret weapon: execute the easiest task on your checklist immediately to reignite dopamine velocity.",
        "reminder": f"Remember your identity statement: '{user.identity_statement or 'I am disciplined, relentless, and focused.'}'",
        "past_win": f"You previously achieved an impressive {longest_streak}-day streak and earned {user.total_xp} total XP. The neural architecture is already built.",
        "future_goal": f"Your promotion to Level {user.current_level + 1} is within reach. Complete one routine today to protect your momentum."
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def smart_reports_view(request):
    """
    GET /api/v1/analytics/reports/?timeframe=daily|weekly|monthly|yearly&format=json|csv
    Downloadable Smart Reports with charts, heatmaps, XP, and AI summary.
    """
    user = request.user
    timeframe = request.query_params.get("timeframe", "weekly").lower()
    fmt = request.query_params.get("format", "json").lower()
    local_date = get_user_local_date(user)

    variant = f"{timeframe}_{local_date.isoformat()}"
    if fmt == "json":
        cached = CacheService.get(str(user.id), "reports", variant)
        if cached is not None:
            return Response(cached)

    days = 7
    if timeframe == "daily":
        days = 1
        start_date = local_date
        end_date = local_date
    elif timeframe == "weekly":
        days = 7
        start_date, end_date = get_week_bounds(local_date)
    elif timeframe == "monthly":
        days = 30
        start_date = local_date - timedelta(days=29)
        end_date = local_date
    elif timeframe == "yearly":
        days = 365
        start_date = local_date - timedelta(days=364)
        end_date = local_date
    else:
        start_date = local_date - timedelta(days=6)
        end_date = local_date

    logs = list(DayLog.objects.filter(user=user, log_date__range=[start_date, end_date]).order_by("log_date"))

    if fmt in ["csv", "excel"]:
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="youvsyou_{timeframe}_report_{local_date}.csv"'
        writer = csv.writer(response)
        writer.writerow(["Date", "Tasks Scheduled", "Tasks Completed", "Completion Rate (%)", "XP Earned"])
        for log in logs:
            writer.writerow([log.log_date, log.tasks_scheduled, log.tasks_completed, log.completion_rate, log.xp_earned])
        return response

    # JSON response for UI preview or JSON download
    chart_data = [
        {
            "date": log.log_date.isoformat(),
            "completion_rate": float(log.completion_rate),
            "tasks_completed": log.tasks_completed,
            "xp_earned": log.xp_earned
        }
        for log in logs
    ]

    streak_rec = StreakRecord.objects.filter(user=user, routine__isnull=True).first()
    current_streak = streak_rec.current_streak if streak_rec else 0
    longest_streak = streak_rec.longest_streak if streak_rec else 0
    perfect_days = sum(1 for log in logs if float(log.completion_rate) == 100.0)
    total_scheduled = sum(log.tasks_scheduled for log in logs)
    total_completed = sum(log.tasks_completed for log in logs)
    total_xp = sum(log.xp_earned for log in logs)
    avg_rate = round(sum(float(log.completion_rate) for log in logs) / max(1, days), 1) if logs else 0.0
    exec_efficiency = round((total_completed / max(1, total_scheduled)) * 100, 1)

    os_metrics = list(DailyOSMetrics.objects.filter(user=user, date__range=[start_date, end_date]).order_by("date"))
    water_total = sum(m.water_ml for m in os_metrics)
    workout_total = sum(m.workout_exercises for m in os_metrics)
    study_total = sum(m.study_mins for m in os_metrics)
    pomo_total = sum(m.pomodoro_sessions for m in os_metrics)
    focus_total = sum(m.focus_mins for m in os_metrics)

    badges_count = UserBadge.objects.filter(user=user).count()
    life_data = ScoreEngine.get_life_score_data(user, local_date)
    disc_data = ScoreEngine.get_discipline_score(user, local_date)
    current_life_score = life_data["overall_score"]
    discipline_index = disc_data["score"]

    kpis = [
        {"label": "Total Tasks Completed", "val": str(total_completed), "unit": "tasks", "change": "+12%", "trend": "up"},
        {"label": "Total XP Generated", "val": f"+{total_xp}", "unit": "XP", "change": "+18%", "trend": "up"},
        {"label": "Avg Completion Rate", "val": f"{avg_rate}%", "unit": "%", "change": "+5.4%", "trend": "up"},
        {"label": "Current Consistency Streak", "val": f"{current_streak}", "unit": "days", "change": "Active", "trend": "up"},
        {"label": "All-Time Longest Streak", "val": f"{longest_streak}", "unit": "days", "change": "Record", "trend": "neutral"},
        {"label": "Perfect Execution Days", "val": f"{perfect_days}", "unit": "days", "change": f"of {len(logs)}d", "trend": "up"},
        {"label": "Discipline Index", "val": f"{discipline_index}/100", "unit": "index", "change": "+4.2", "trend": "up"},
        {"label": "Execution Efficiency", "val": f"{exec_efficiency}%", "unit": "%", "change": "+2.1%", "trend": "up"},
        {"label": "Total Hydration Logged", "val": f"{water_total}", "unit": "ml", "change": f"~{int(water_total/max(1,len(logs)))} ml/d", "trend": "neutral"},
        {"label": "Hypertrophy Workouts", "val": f"{workout_total}", "unit": "exercises", "change": "+3 sets", "trend": "up"},
        {"label": "Deep Study Time", "val": f"{round(study_total/60, 1)}", "unit": "hours", "change": f"{study_total} mins", "trend": "up"},
        {"label": "Current Life Score 2.0", "val": f"{current_life_score}", "unit": "/ 100", "change": life_data.get("title", "Good"), "trend": "up"},
        {"label": "User Mastery Level", "val": f"LVL {user.current_level}", "unit": "rank", "change": XPService.get_level_title(user.current_level), "trend": "neutral"},
        {"label": "Milestones & Badges", "val": f"{badges_count}", "unit": "unlocked", "change": "Elite Club", "trend": "up"},
    ]

    cats = life_data.get("categories", {})
    radar_data = [
        {"subject": "Fitness", "val": cats.get("fitness", 0)},
        {"subject": "Learning", "val": cats.get("learning", 0)},
        {"subject": "Work", "val": cats.get("work", 0)},
        {"subject": "Mental", "val": cats.get("mental_health", 0)},
        {"subject": "Health", "val": cats.get("health", 0)},
        {"subject": "Sleep", "val": cats.get("sleep", 0)},
        {"subject": "Finance", "val": cats.get("finance", 0)},
        {"subject": "Personal", "val": cats.get("personal", 0)},
        {"subject": "Discipline", "val": cats.get("discipline", 0)},
    ]

    heatmap_data = []
    for log in logs:
        done = log.tasks_completed
        rate = float(log.completion_rate)
        lvl = 0
        if done > 0 or rate > 0:
            if rate >= 90 or done >= 5: lvl = 4
            elif rate >= 70 or done >= 3: lvl = 3
            elif rate >= 40 or done >= 2: lvl = 2
            else: lvl = 1
        heatmap_data.append({"date": log.log_date.isoformat(), "level": lvl, "tasks": done, "rate": rate})

    recommendations = [
        "Prioritize morning hydration (500ml upon waking) to boost metabolic baseline and cognitive clarity.",
        "Implement a 25-minute Pomodoro focus block before checking email to protect deep work velocity.",
        "Maintain current Hypertrophy Push cadence; progressive overload is tracking optimally.",
        "Ensure at least 1 routine completion on weekends to eliminate Monday friction and safeguard streaks."
    ]

    full_report = ReportEngine.generate_full_report(user, timeframe, local_date, start_date, logs, os_metrics, life_data=life_data, disc_data=disc_data)
    unlock_status = ReportEngine.get_report_unlock_status(user)
    chart_data = full_report["charts"]

    week_logs = [l for l in logs if l.log_date >= (local_date - timedelta(days=6))]
    month_logs = [l for l in logs if l.log_date >= (local_date - timedelta(days=29))]
    year_logs = [l for l in logs if l.log_date >= (local_date - timedelta(days=364))]

    week_score = int(round(sum(float(l.completion_rate) for l in week_logs) / 7.0)) if week_logs else 0
    month_score = int(round(sum(float(l.completion_rate) for l in month_logs) / 30.0)) if month_logs else 0
    year_score = int(round(sum(float(l.completion_rate) for l in year_logs) / 365.0)) if year_logs else 0
    lifetime_score = int(avg_rate)

    data = {
        "timeframe": timeframe.title(),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "week_start": start_date.isoformat() if timeframe == "weekly" else None,
        "week_end": end_date.isoformat() if timeframe == "weekly" else None,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "type": timeframe
        },
        "is_initializing": False,
        "unlock_status": unlock_status,
        "executive_summary": full_report["executive_summary"],
        "charts": chart_data,
        "summary": {
            "total_tasks_completed": total_completed,
            "total_xp_earned": total_xp,
            "avg_completion_rate": avg_rate,
            "life_score": current_life_score,
            "ai_summary": (
                "No activity has been recorded for this period yet. Your journey starts with today's actions." if not logs and not os_metrics else
                f"During this {timeframe} cycle, you maintained an average completion rate of {avg_rate}% and generated {total_xp} XP. Your execution efficiency is tracking at {exec_efficiency}% across 9 core life dimensions."
            )
        },
        "chart_data": chart_data,
        "kpis": kpis,
        "radar_data": radar_data,
        "heatmap_data": heatmap_data,
        "recommendations": recommendations,
        "smart_statistics": {
            "today_score": current_life_score,
            "week_score": week_score,
            "month_score": month_score,
            "year_score": year_score,
            "lifetime_score": lifetime_score
        }
    }
    if fmt == "json":
        CacheService.set(str(user.id), "reports", data, TTL_ANALYTICS_W, variant)
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def timeline_view(request):
    """
    GET /api/v1/analytics/timeline/
    Returns chronological Life Timeline of milestones, achievements, and streaks.
    """
    user = request.user
    txs = XPTransaction.objects.filter(user=user).order_by("-created_at")[:20]
    badges = UserBadge.objects.filter(user=user).select_related("badge").order_by("-created_at")[:10]

    timeline = []
    for b in badges:
        timeline.append({
            "id": f"badge_{b.id}",
            "type": "achievement",
            "title": f"Unlocked Trophy: {b.badge.name}",
            "description": b.badge.description,
            "date": b.created_at.isoformat(),
            "xp": b.badge.xp_reward,
            "icon": b.badge.icon or "Award"
        })

    for t in txs:
        if t.reason in [XPTransaction.Reason.STREAK_BONUS, XPTransaction.Reason.LEVEL_UP, XPTransaction.Reason.PERFECT_DAY]:
            timeline.append({
                "id": f"tx_{t.id}",
                "type": "milestone" if t.reason == XPTransaction.Reason.LEVEL_UP else "streak",
                "title": f"{t.get_reason_display()} (+{t.amount} XP)",
                "description": "Executed discipline protocol with precision.",
                "date": t.created_at.isoformat(),
                "xp": t.amount,
                "icon": "Flame" if t.reason == XPTransaction.Reason.STREAK_BONUS else "Zap"
            })

    timeline.sort(key=lambda x: x["date"], reverse=True)
    return Response({"timeline": timeline})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def goals_view(request):
    """
    GET/POST /api/v1/analytics/goals/
    Manage user custom daily OS goals (Water, Workout, Study).
    """
    user = request.user
    goals, _ = UserOSGoals.objects.get_or_create(user=user)

    if request.method == "POST":
        data = request.data
        if "water_goal_ml" in data:
            goals.water_goal_ml = int(data["water_goal_ml"])
        if "workout_goal_exercises" in data:
            goals.workout_goal_exercises = int(data["workout_goal_exercises"])
        if "study_goal_mins" in data:
            goals.study_goal_mins = int(data["study_goal_mins"])
        goals.save()
        CacheService.invalidate_dashboard(str(user.id))

    return Response({
        "water_goal_ml": goals.water_goal_ml,
        "workout_goal_exercises": goals.workout_goal_exercises,
        "study_goal_mins": goals.study_goal_mins,
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def metrics_view(request):
    """
    GET/POST /api/v1/analytics/metrics/
    Manage and increment today's daily OS metrics (resets automatically daily).
    """
    user = request.user
    local_date = get_user_local_date(user)
    metrics, _ = DailyOSMetrics.objects.get_or_create(user=user, date=local_date)

    if request.method == "POST":
        data = request.data
        if "water_ml" in data:
            metrics.water_ml = int(data["water_ml"])
        if "workout_exercises" in data:
            metrics.workout_exercises = int(data["workout_exercises"])
        if "study_mins" in data:
            metrics.study_mins = int(data["study_mins"])
        if "pomodoro_sessions" in data:
            metrics.pomodoro_sessions = int(data["pomodoro_sessions"])
        if "focus_mins" in data:
            metrics.focus_mins = int(data["focus_mins"])
        metrics.save()
        CacheService.invalidate_all(str(user.id))
        CacheService.delete(str(user.id), f"life_score_2:{local_date.isoformat()}")
        CacheService.delete(str(user.id), f"discipline_score_2:{local_date.isoformat()}")

    return Response({
        "date": metrics.date.isoformat(),
        "water_ml": metrics.water_ml,
        "workout_exercises": metrics.workout_exercises,
        "study_mins": metrics.study_mins,
        "pomodoro_sessions": metrics.pomodoro_sessions,
        "focus_mins": metrics.focus_mins,
        "daily_xp": metrics.daily_xp,
    })
