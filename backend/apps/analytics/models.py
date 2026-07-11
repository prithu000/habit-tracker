"""
FORGE — Analytics App Models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class WeeklyInsight(BaseModel):
    class Trend(models.TextChoices):
        IMPROVING = "improving", "Improving"
        STABLE = "stable", "Stable"
        DECLINING = "declining", "Declining"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weekly_insights")
    week_start = models.DateField()
    best_routine = models.ForeignKey(
        "routines.Routine", on_delete=models.SET_NULL,
        null=True, blank=True
    )
    completion_trend = models.CharField(max_length=20, choices=Trend.choices, default=Trend.STABLE)
    highlight_text = models.TextField()
    avg_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analytics_weeklyinsight"
        unique_together = [("user", "week_start")]
        ordering = ["-week_start"]

    def __str__(self):
        return f"{self.user.email} — Week of {self.week_start}"


class LifeScoreSnapshot(BaseModel):
    """
    Daily/Weekly snapshot of a user's 9-dimensional Life Score and overall classification.
    
    CRITICAL: All score defaults MUST be 0 to prevent inflated scores for new users.
    ScoreEngine computes actual values based on user activity.
    """
    class Title(models.TextChoices):
        EXCELLENT = "Excellent", "Excellent"
        GOOD = "Good", "Good"
        AVERAGE = "Average", "Average"
        POOR = "Poor", "Poor"
        CRITICAL = "Critical", "Critical"
        INITIALIZING = "Initializing", "Initializing"
        # Legacy choices preserved for backwards compatibility
        LOST = "Lost", "Lost"
        IMPROVING = "Improving", "Improving"
        CONSISTENT = "Consistent", "Consistent"
        ELITE = "Elite", "Elite"
        LEGEND = "Legend", "Legend"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="life_scores")
    date = models.DateField(db_index=True)
    fitness_score = models.PositiveIntegerField(default=0)
    learning_score = models.PositiveIntegerField(default=0)
    work_score = models.PositiveIntegerField(default=0)
    mental_health_score = models.PositiveIntegerField(default=0)
    health_score = models.PositiveIntegerField(default=0)
    sleep_score = models.PositiveIntegerField(default=0)
    finance_score = models.PositiveIntegerField(default=0)
    personal_score = models.PositiveIntegerField(default=0)
    discipline_score = models.PositiveIntegerField(default=0)
    overall_score = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=30, choices=Title.choices, default=Title.INITIALIZING)
    ai_analysis = models.TextField(blank=True, default="Complete your first day to unlock your Personal Operating System analytics.")
    improvement_suggestions = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "analytics_lifescoresnapshot"
        unique_together = [("user", "date")]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — Life Score {self.overall_score} ({self.title}) on {self.date}"

    @classmethod
    def calculate_title(cls, score: int, is_initializing: bool = False) -> str:
        if is_initializing:
            return cls.Title.INITIALIZING
        if score >= 85:
            return cls.Title.EXCELLENT
        if score >= 70:
            return cls.Title.GOOD
        if score >= 55:
            return cls.Title.AVERAGE
        if score >= 40:
            return cls.Title.POOR
        return cls.Title.CRITICAL


class UserOSGoals(BaseModel):
    """
    User custom daily goals for Hydration, Hypertrophy Workout, and Deep Study.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="os_goals")
    water_goal_ml = models.PositiveIntegerField(default=3000)
    workout_goal_exercises = models.PositiveIntegerField(default=8)
    study_goal_mins = models.PositiveIntegerField(default=120)

    class Meta:
        db_table = "analytics_userosgoals"
        verbose_name = "User OS Goals"
        verbose_name_plural = "User OS Goals"

    def __str__(self):
        return f"{self.user.email} — Goals (Water: {self.water_goal_ml}ml, Workout: {self.workout_goal_exercises}, Study: {self.study_goal_mins}m)"


class DailyOSMetrics(BaseModel):
    """
    Daily tracked OS metrics that automatically reset at 12:00 AM user local timezone.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_os_metrics")
    date = models.DateField(db_index=True)
    water_ml = models.PositiveIntegerField(default=0)
    workout_exercises = models.PositiveIntegerField(default=0)
    study_mins = models.PositiveIntegerField(default=0)
    pomodoro_sessions = models.PositiveIntegerField(default=0)
    focus_mins = models.PositiveIntegerField(default=0)
    daily_xp = models.PositiveIntegerField(default=0)
    daily_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = "analytics_dailyosmetrics"
        unique_together = [("user", "date")]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — OS Metrics for {self.date}"


class CustomWidget(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="custom_widgets")
    name = models.CharField(max_length=100)
    goal = models.PositiveIntegerField()
    unit = models.CharField(max_length=50)
    icon = models.CharField(max_length=50, default="check")
    color = models.CharField(max_length=50, default="blue")
    step_size = models.PositiveIntegerField(default=1)
    
    reset_daily = models.BooleanField(default=True)
    show_in_reports = models.BooleanField(default=True)
    show_on_dashboard = models.BooleanField(default=True)
    
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "analytics_customwidget"
        ordering = ["display_order", "created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.name} ({self.goal} {self.unit})"


class WidgetLog(BaseModel):
    widget = models.ForeignKey(CustomWidget, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField(db_index=True)
    progress = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "analytics_widgetlog"
        unique_together = [("widget", "date")]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.widget.name} on {self.date}: {self.progress}/{self.widget.goal}"


class ReportSettings(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="report_settings")
    selected_habit_breakdown = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "analytics_reportsettings"

    def __str__(self):
        return f"{self.user.email} — Report Settings"
