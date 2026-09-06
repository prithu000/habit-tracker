"""
Migration 0006 — Data: backfill Task.user, Task.category, Task.frequency from Routine.

Steps:
1. Copy routine.user → task.user for every Task.
2. Copy recurrence_type from RoutineSchedule → task.frequency.
3. Map routine.name to task.category using keyword heuristics.
"""
from django.db import migrations


# Keyword → category mapping (checked in order, case-insensitive)
KEYWORD_MAP = [
    (["gym", "fitness", "workout", "run", "cardio", "lift", "swim", "sport", "exercise", "yoga", "walk"], "fitness"),
    (["study", "learn", "read", "book", "course", "class", "practice", "code", "program", "research", "review", "language"], "learning"),
    (["work", "job", "office", "project", "meeting", "task", "client", "email", "report", "professional", "career"], "work"),
    (["meditat", "mental", "mindful", "journal", "therapy", "breathe", "gratitude", "reflect", "anxiety", "stress"], "mental_health"),
    (["health", "diet", "nutrition", "doctor", "vitamin", "supplement", "weight", "body", "water", "hydrat"], "health"),
    (["sleep", "rest", "recovery", "nap", "bed", "night"], "sleep"),
    (["finance", "money", "budget", "invest", "saving", "spend", "expense", "bill", "pay", "bank"], "finance"),
    (["discipline"], "discipline"),
    (["personal"], "personal"),
]


def _name_to_category(name: str) -> str:
    lower = name.lower()
    for keywords, category in KEYWORD_MAP:
        if any(kw in lower for kw in keywords):
            return category
    return "personal"


def backfill_tasks(apps, schema_editor):
    Task = apps.get_model("routines", "Task")
    RoutineSchedule = apps.get_model("routines", "RoutineSchedule")

    # Build schedule map: routine_id → recurrence_type
    schedule_map = {
        s.routine_id: s.recurrence_type
        for s in RoutineSchedule.objects.select_related("routine").all()
    }

    tasks = Task.objects.select_related("routine").all()
    bulk = []
    for task in tasks:
        if task.routine is None:
            continue
        routine = task.routine

        # 1. User ownership
        task.user_id = routine.user_id

        # 2. Frequency from RoutineSchedule
        recurrence = schedule_map.get(routine.id, "daily")
        if recurrence == "weekly":
            task.frequency = "weekly"
        else:
            task.frequency = "daily"

        # 3. Category from routine name
        task.category = _name_to_category(routine.name)

        bulk.append(task)

    # Batch update in chunks of 500
    chunk_size = 500
    for i in range(0, len(bulk), chunk_size):
        Task.objects.bulk_update(
            bulk[i:i + chunk_size],
            ["user_id", "category", "frequency"],
        )


def reverse_backfill(apps, schema_editor):
    # No-op reverse: clearing the backfilled values would leave nulls
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("routines", "0005_task_add_user_category_frequency_due_date"),
    ]

    operations = [
        migrations.RunPython(backfill_tasks, reverse_backfill),
    ]
