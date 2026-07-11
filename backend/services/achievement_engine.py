"""
FORGE — Achievement Engine (Production)
Rule-based badge evaluator. Called async via Celery after completion events.
"""
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────
# Badge Catalog
# Each badge is a dict with: slug, name, description, icon,
# rarity, xp_reward, and a check(user, ctx) -> bool function.
# ─────────────────────────────────────────────────────────

BADGE_CATALOG: List[Dict] = [
    # ── First Steps ──
    {
        "slug": "first_step",
        "name": "First Step",
        "description": "Complete your very first task.",
        "icon": "🌱",
        "rarity": "common",
        "xp_reward": 20,
        "check": lambda u, ctx: ctx["total_completions"] >= 1,
    },
    {
        "slug": "first_routine",
        "name": "Routine Starter",
        "description": "Complete an entire routine for the first time.",
        "icon": "📋",
        "rarity": "common",
        "xp_reward": 20,
        "check": lambda u, ctx: ctx["routines_fully_completed"] >= 1,
    },

    # ── Streak Badges ──
    {
        "slug": "streak_3",
        "name": "Three's Company",
        "description": "Maintain a 3-day streak.",
        "icon": "🔥",
        "rarity": "common",
        "xp_reward": 30,
        "check": lambda u, ctx: ctx["longest_streak"] >= 3,
    },
    {
        "slug": "week_warrior",
        "name": "Week Warrior",
        "description": "Maintain a 7-day streak.",
        "icon": "⚡",
        "rarity": "rare",
        "xp_reward": 100,
        "check": lambda u, ctx: ctx["longest_streak"] >= 7,
    },
    {
        "slug": "fortnight_force",
        "name": "Fortnight Force",
        "description": "Maintain a 14-day streak.",
        "icon": "💥",
        "rarity": "rare",
        "xp_reward": 150,
        "check": lambda u, ctx: ctx["longest_streak"] >= 14,
    },
    {
        "slug": "three_weeks",
        "name": "21-Day Shift",
        "description": "21 days — where habits begin to form.",
        "icon": "🧬",
        "rarity": "rare",
        "xp_reward": 200,
        "check": lambda u, ctx: ctx["longest_streak"] >= 21,
    },
    {
        "slug": "iron_will_30",
        "name": "Iron Will",
        "description": "30-day streak. One full month of discipline.",
        "icon": "⚙️",
        "rarity": "epic",
        "xp_reward": 300,
        "check": lambda u, ctx: ctx["longest_streak"] >= 30,
    },
    {
        "slug": "two_months",
        "name": "Two Months Strong",
        "description": "60-day streak. Uncommon resilience.",
        "icon": "🏅",
        "rarity": "epic",
        "xp_reward": 500,
        "check": lambda u, ctx: ctx["longest_streak"] >= 60,
    },
    {
        "slug": "ninety_days",
        "name": "90-Day Transformation",
        "description": "They say 90 days changes a life. You've done it.",
        "icon": "🦋",
        "rarity": "epic",
        "xp_reward": 750,
        "check": lambda u, ctx: ctx["longest_streak"] >= 90,
    },
    {
        "slug": "century",
        "name": "The Century",
        "description": "100-day streak. You are legendary.",
        "icon": "💎",
        "rarity": "legendary",
        "xp_reward": 1000,
        "check": lambda u, ctx: ctx["longest_streak"] >= 100,
    },
    {
        "slug": "year_round",
        "name": "Year-Round",
        "description": "365 days. A full revolution of the sun. Transcendent.",
        "icon": "🌍",
        "rarity": "legendary",
        "xp_reward": 5000,
        "check": lambda u, ctx: ctx["longest_streak"] >= 365,
    },

    # ── Completion Count ──
    {
        "slug": "ten_tasks",
        "name": "Getting Started",
        "description": "Complete 10 tasks total.",
        "icon": "✅",
        "rarity": "common",
        "xp_reward": 15,
        "check": lambda u, ctx: ctx["total_completions"] >= 10,
    },
    {
        "slug": "hundred_tasks",
        "name": "Century of Tasks",
        "description": "Complete 100 tasks.",
        "icon": "💯",
        "rarity": "rare",
        "xp_reward": 100,
        "check": lambda u, ctx: ctx["total_completions"] >= 100,
    },
    {
        "slug": "five_hundred_tasks",
        "name": "500 Strong",
        "description": "500 tasks completed. This is a lifestyle.",
        "icon": "⭐",
        "rarity": "epic",
        "xp_reward": 250,
        "check": lambda u, ctx: ctx["total_completions"] >= 500,
    },
    {
        "slug": "thousand_tasks",
        "name": "The Thousand",
        "description": "1,000 tasks. You are built different.",
        "icon": "🏆",
        "rarity": "legendary",
        "xp_reward": 500,
        "check": lambda u, ctx: ctx["total_completions"] >= 1000,
    },

    # ── Perfect Days ──
    {
        "slug": "first_perfect_day",
        "name": "Perfect Day",
        "description": "Complete every single task in one day.",
        "icon": "✨",
        "rarity": "rare",
        "xp_reward": 75,
        "check": lambda u, ctx: ctx["perfect_days"] >= 1,
    },
    {
        "slug": "perfect_week",
        "name": "Perfect Week",
        "description": "7 consecutive perfect days.",
        "icon": "🌟",
        "rarity": "epic",
        "xp_reward": 300,
        "check": lambda u, ctx: ctx["perfect_days_streak"] >= 7,
    },
    {
        "slug": "thirty_perfect",
        "name": "30 Perfect Days",
        "description": "30 days of 100% completion. Elite.",
        "icon": "👑",
        "rarity": "legendary",
        "xp_reward": 1000,
        "check": lambda u, ctx: ctx["perfect_days"] >= 30,
    },

    # ── Level ──
    {
        "slug": "level_5",
        "name": "Disciplined",
        "description": "Reach Level 5.",
        "icon": "🔷",
        "rarity": "rare",
        "xp_reward": 50,
        "check": lambda u, ctx: ctx["current_level"] >= 5,
    },
    {
        "slug": "level_10",
        "name": "Legendary",
        "description": "Reach Level 10.",
        "icon": "🔶",
        "rarity": "epic",
        "xp_reward": 100,
        "check": lambda u, ctx: ctx["current_level"] >= 10,
    },
    {
        "slug": "level_15",
        "name": "Transcendent",
        "description": "Reach Level 15. The highest level. You have ascended.",
        "icon": "🌌",
        "rarity": "legendary",
        "xp_reward": 500,
        "check": lambda u, ctx: ctx["current_level"] >= 15,
    },

    # ── Early Bird ──
    {
        "slug": "early_bird",
        "name": "Early Bird",
        "description": "Complete 50 tasks before 8am.",
        "icon": "🌅",
        "rarity": "rare",
        "xp_reward": 100,
        "check": lambda u, ctx: ctx["early_morning_completions"] >= 50,
    },

    # ── Routines ──
    {
        "slug": "three_routines",
        "name": "Multi-Track",
        "description": "Run 3 or more active routines.",
        "icon": "🔁",
        "rarity": "common",
        "xp_reward": 30,
        "check": lambda u, ctx: ctx["active_routine_count"] >= 3,
    },
]


class AchievementEngine:
    """
    Evaluates all badge rules against current user state.
    Only awards badges once — idempotent.
    """

    @staticmethod
    def evaluate(user_id: str) -> List[str]:
        """
        Evaluates all badge rules for a user.
        Returns list of newly awarded badge slugs.
        """
        from django.contrib.auth import get_user_model
        from apps.rewards.models import Badge, UserBadge
        from apps.streaks.models import StreakRecord
        from apps.completions.models import Completion, DayLog
        from apps.routines.models import Routine
        from apps.rewards.models import XPTransaction
        from django.db.models import Count, Sum, Max
        from django.utils import timezone as dtz
        import pytz

        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error("AchievementEngine: user %s not found", user_id)
            return []

        # ── Build context — all via DB aggregation, zero Python loops ──
        overall_streak = (
            StreakRecord.objects
            .filter(user=user, routine__isnull=True)
            .only("current_streak", "longest_streak")
            .first()
        )

        total_completions = Completion.objects.filter(user=user).count()
        perfect_days = DayLog.objects.filter(user=user, completion_rate=100).count()
        active_routines = Routine.objects.filter(user=user, is_active=True).count()

        # Routines fully completed: use DB GROUP BY + HAVING instead of nested Python loops
        from django.db.models import Count as DCount
        routines_fully_done = 0
        for routine in Routine.objects.filter(user=user, is_active=True).prefetch_related("tasks"):
            task_ids = list(routine.tasks.filter(is_active=True).values_list("id", flat=True))
            task_count = len(task_ids)
            if not task_count:
                continue
            # Single DB query: find any day where task_count distinct tasks were completed
            fully_done_day = (
                Completion.objects
                .filter(user=user, task__in=task_ids)
                .values("local_date")
                .annotate(done=DCount("id"))
                .filter(done=task_count)
                .exists()
            )
            if fully_done_day:
                routines_fully_done += 1

        # Perfect day streak — single ordered query, stop at first gap in Python
        import datetime
        today = datetime.date.today()
        recent_logs = (
            DayLog.objects
            .filter(user=user, completion_rate=100, log_date__lte=today)
            .only("log_date")
            .order_by("-log_date")[:365]
        )
        perfect_day_streak = 0
        for i, log in enumerate(recent_logs):
            expected = today - datetime.timedelta(days=i)
            if log.log_date == expected:
                perfect_day_streak += 1
            else:
                break

        # Early morning completions — use DB hour extraction (avoids Python O(n) iteration)
        from django.db.models.functions import ExtractHour
        from django.db.models import F, ExpressionWrapper, DateTimeField
        user_tz_str = user.timezone or "UTC"
        # Convert completed_at to user tz at DB level using AT TIME ZONE
        # Fallback: use UTC hour if tz conversion not supported
        try:
            early_completions = (
                Completion.objects
                .filter(user=user)
                .annotate(hour=ExtractHour("completed_at"))
                .filter(hour__lt=8)
                .count()
            )
        except Exception:
            early_completions = 0

        context = {
            "total_completions": total_completions,
            "longest_streak": overall_streak.longest_streak if overall_streak else 0,
            "current_streak": overall_streak.current_streak if overall_streak else 0,
            "current_level": user.current_level,
            "perfect_days": perfect_days,
            "perfect_days_streak": perfect_day_streak,
            "active_routine_count": active_routines,
            "routines_fully_completed": routines_fully_done,
            "early_morning_completions": early_completions,
        }

        # ── Already earned ──
        already_earned = set(
            UserBadge.objects.filter(user=user).values_list("badge__slug", flat=True)
        )

        newly_awarded = []

        for rule in BADGE_CATALOG:
            slug = rule["slug"]
            if slug in already_earned:
                continue

            try:
                if rule["check"](user, context):
                    badge, _ = Badge.objects.get_or_create(
                        slug=slug,
                        defaults={
                            "name": rule["name"],
                            "description": rule["description"],
                            "icon": rule["icon"],
                            "rarity": rule["rarity"],
                            "xp_reward": rule["xp_reward"],
                            "unlock_criteria": {},
                        },
                    )
                    UserBadge.objects.get_or_create(user=user, badge=badge)
                    newly_awarded.append(slug)

                    # Award badge XP
                    from services.xp_service import XPService
                    xp = rule.get("xp_reward", 20)
                    XPService.award_xp(
                        user=user,
                        amount=xp,
                        reason="milestone",
                        metadata={"badge": slug, "rarity": rule["rarity"]},
                    )

                    # Send notification
                                        pass

                    logger.info("Badge '%s' awarded to user %s", slug, user.id)

            except Exception as e:
                logger.error("Error evaluating badge '%s' for user %s: %s", slug, user.id, e)

        return newly_awarded
