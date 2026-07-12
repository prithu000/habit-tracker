"""
FORGE — Rewards App Models
XP transactions, Badges, UserBadge.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class XPTransaction(BaseModel):
    class Reason(models.TextChoices):
        TASK_COMPLETE = "task_complete", "Task Completed"
        STREAK_BONUS = "streak_bonus", "Streak Bonus"
        MILESTONE = "milestone", "Milestone"
        LEVEL_UP = "level_up", "Level Up"
        LOGIN_BONUS = "login_bonus", "Daily Login"
        PERFECT_DAY = "perfect_day", "Perfect Day"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="xp_transactions")
    amount = models.IntegerField()  # Can support negative in future
    reason = models.CharField(max_length=30, choices=Reason.choices)
    reference_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "rewards_xptransaction"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.email} +{self.amount} XP [{self.reason}]"


class Badge(models.Model):
    class Rarity(models.TextChoices):
        COMMON = "common", "Common"
        RARE = "rare", "Rare"
        EPIC = "epic", "Epic"
        LEGENDARY = "legendary", "Legendary"

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.TextField()  # SVG key or URL
    rarity = models.CharField(max_length=20, choices=Rarity.choices, default=Rarity.COMMON)
    unlock_criteria = models.JSONField(default=dict)  # Flexible rule engine
    xp_reward = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "rewards_badge"

    def __str__(self):
        return f"{self.name} ({self.rarity})"


class UserBadge(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="badges")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    seen = models.BooleanField(default=False)  # For celebration modal

    class Meta:
        db_table = "rewards_userbadge"
        unique_together = [("user", "badge")]

    def __str__(self):
        return f"{self.user.email} — {self.badge.name}"




class StreakFreeze(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="streak_freeze")
    quantity = models.PositiveIntegerField(default=1)  # Free initial freeze!
    total_used = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "rewards_streakfreeze"

    def __str__(self):
        return f"{self.user.email} — {self.quantity} Freezes Available"


class LeagueRanking(BaseModel):
    class Division(models.TextChoices):
        BRONZE = "Bronze", "Bronze"
        SILVER = "Silver", "Silver"
        GOLD = "Gold", "Gold"
        PLATINUM = "Platinum", "Platinum"
        DIAMOND = "Diamond", "Diamond"
        MASTER = "Master", "Master"
        GRANDMASTER = "Grandmaster", "Grandmaster"
        LEGEND = "Legend", "Legend"
        MYTHIC = "Mythic", "Mythic"
        IMMORTAL = "Immortal", "Immortal"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="league")
    division = models.CharField(max_length=20, choices=Division.choices, default=Division.BRONZE)
    score = models.PositiveIntegerField(default=100)  # Calculated rating
    rank = models.PositiveIntegerField(default=9999)
    country = models.CharField(max_length=50, default="United States")
    city = models.CharField(max_length=50, default="San Francisco")
    university = models.CharField(max_length=100, default="DeepMind University")

    class Meta:
        db_table = "rewards_leagueranking"
        indexes = [models.Index(fields=["division", "-score"])]

    def __str__(self):
        return f"{self.user.email} — {self.division} (Score: {self.score}, Rank: {self.rank})"


class HardcoreAchievement(models.Model):
    class Rarity(models.TextChoices):
        HIDDEN = "Hidden", "Hidden"
        SECRET = "Secret", "Secret"
        LEGENDARY = "Legendary", "Legendary"
        MYTHIC = "Mythic", "Mythic"
        IMPOSSIBLE = "Impossible", "Impossible"

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default="Trophy")
    rarity = models.CharField(max_length=20, choices=Rarity.choices, default=Rarity.SECRET)
    category = models.CharField(max_length=50, default="general")
    target_value = models.PositiveIntegerField(default=100)
    xp_reward = models.PositiveIntegerField(default=500)


    class Meta:
        db_table = "rewards_hardcoreachievement"

    def __str__(self):
        return f"{self.name} [{self.rarity}]"


class UserHardcoreAchievement(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hardcore_achievements")
    achievement = models.ForeignKey(HardcoreAchievement, on_delete=models.CASCADE)
    progress = models.PositiveIntegerField(default=0)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    seen = models.BooleanField(default=False)

    class Meta:
        db_table = "rewards_userhardcoreachievement"
        unique_together = [("user", "achievement")]

    def __str__(self):
        return f"{self.user.email} — {self.achievement.name} ({self.progress}/{self.achievement.target_value})"

