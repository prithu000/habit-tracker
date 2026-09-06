"""
YOU VS YOU — Starter Routine Tasks Generator
Pre-populates baseline daily habits across all routine categories so users have
an immediate, structured roadmap without friction.
"""
import logging
from typing import List
from apps.routines.models import Task

logger = logging.getLogger(__name__)

DEFAULT_STARTER_TASKS = [
    # ── Fitness ──
    {
        "category": Task.Category.FITNESS,
        "name": "Gym & Strength Training",
        "description": "Daily workout, lifting, or calisthenics session",
        "duration_minutes": 45,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.FITNESS,
        "name": "Morning Walk & Mobility Stretch",
        "description": "Get steps in and loosen up joints",
        "duration_minutes": 20,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Learning ──
    {
        "category": Task.Category.LEARNING,
        "name": "Daily Non-Fiction Reading",
        "description": "Read 15-20 minutes of a high-value book or article",
        "duration_minutes": 20,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.LEARNING,
        "name": "Skill & Knowledge Practice",
        "description": "Deep dive into craft, coding, design, or language",
        "duration_minutes": 30,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Work / Execution ──
    {
        "category": Task.Category.WORK,
        "name": "Deep Work Sprint (No Distractions)",
        "description": "High-leverage focus block on your primary objective",
        "duration_minutes": 60,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.WORK,
        "name": "Review Priorities & Plan Tomorrow",
        "description": "Clear inbox and prepare tomorrow's top 3 tasks",
        "duration_minutes": 15,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Mental Health ──
    {
        "category": Task.Category.MENTAL_HEALTH,
        "name": "Mindfulness & Breathwork",
        "description": "Calm nervous system and reset mental clarity",
        "duration_minutes": 10,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.MENTAL_HEALTH,
        "name": "Evening Reflection & Gratitude Log",
        "description": "Decompress and record today's wins",
        "duration_minutes": 10,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Health & Nutrition ──
    {
        "category": Task.Category.HEALTH,
        "name": "Drink 2.5L Water (Hydration Goal)",
        "description": "Sustain energy and cellular hydration throughout the day",
        "duration_minutes": 5,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.HEALTH,
        "name": "Nutritious Whole-Food Meals",
        "description": "Eat clean protein, vegetables, and avoid junk snacking",
        "duration_minutes": 30,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Sleep & Recovery ──
    {
        "category": Task.Category.SLEEP,
        "name": "7-8 Hours Restorative Sleep",
        "description": "Maintain consistent sleep and wake timing",
        "duration_minutes": 480,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.SLEEP,
        "name": "No Screens 30 Mins Before Bed",
        "description": "Wind down with dim lighting and relaxation",
        "duration_minutes": 30,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },

    # ── Finance ──
    {
        "category": Task.Category.FINANCE,
        "name": "Track Daily Expenses & Budget",
        "description": "Stay conscious of cashflow and financial discipline",
        "duration_minutes": 5,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },

    # ── Personal ──
    {
        "category": Task.Category.PERSONAL,
        "name": "Tidy Workspace & Living Environment",
        "description": "A clear workspace produces clear thinking",
        "duration_minutes": 15,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },

    # ── Discipline ──
    {
        "category": Task.Category.DISCIPLINE,
        "name": "Tackle Hardest Task First",
        "description": "Defeat morning procrastination and take the high ground",
        "duration_minutes": 45,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 1,
    },
    {
        "category": Task.Category.DISCIPLINE,
        "name": "Zero Mindless Social Media Scrolling",
        "description": "Guard your attention span and dopamine baseline",
        "duration_minutes": 10,
        "frequency": Task.Frequency.DAILY,
        "sort_order": 2,
    },
]


def seed_starter_tasks_for_user(user, force: bool = False) -> List[Task]:
    """
    Creates starter routine tasks for a user if they have none,
    or if force is True.
    """
    if not force:
        existing_count = Task.objects.filter(user=user, is_active=True).count()
        if existing_count > 0:
            return []

    created_tasks = []
    for item in DEFAULT_STARTER_TASKS:
        task, created = Task.objects.get_or_create(
            user=user,
            name=item["name"],
            category=item["category"],
            defaults={
                "description": item["description"],
                "duration_minutes": item["duration_minutes"],
                "frequency": item["frequency"],
                "sort_order": item["sort_order"],
                "is_active": True,
            },
        )
        if created:
            created_tasks.append(task)

    logger.info(f"Seeded {len(created_tasks)} starter tasks for user {user.email}")
    return created_tasks
