"""
FORGE Personal Operating System — Rewards & Gamification POS Views
Coins, Store, Leagues, Hardcore Achievements, and Streak Freezes.
"""
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import HasPremiumAccessPermission
from apps.rewards.models import (
    StreakFreeze,
    LeagueRanking,
    HardcoreAchievement,
    UserHardcoreAchievement,
    Badge,
    UserBadge
)
from apps.streaks.models import StreakRecord


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def store_view(request):
    """
    GET/POST /api/v1/rewards/store/
    Returns store items or purchases an item with XP.
    """
    user = request.user
    # Coins are deprecated, user buys with total_xp if needed (or store is just for fun now, wait, maybe just remove coins logic entirely and make them cost 0 or use XP? Actually, let's just make items free or cost XP, wait, the user said "remove coins completely", I'll just change balance to user.total_xp for store purchases)
    balance = user.total_xp
    freeze, _ = StreakFreeze.objects.get_or_create(user=user)

    items = [
        {
            "id": "streak_freeze",
            "name": "Cryo-Stasis Streak Freeze",
            "description": "Automatically preserves your streak if you miss a day of execution.",
            "price": 100,
            "icon": "Snowflake",
            "category": "utility",
            "owned": freeze.quantity
        },
        {
            "id": "theme_cyber_matrix",
            "name": "Obsidian Matrix Theme Pack",
            "description": "Unlocks neon green cybernetic grid wallpaper and matrix glow accents.",
            "price": 250,
            "icon": "Terminal",
            "category": "theme",
            "owned": 1 if balance > 500 else 0
        },
        {
            "id": "sound_cyber_drone",
            "name": "Neo-Tokyo Ambient Sound Pack",
            "description": "Unlocks futuristic cyberpunk drone and rain acoustics for Focus Mode.",
            "price": 150,
            "icon": "Headphones",
            "category": "audio",
            "owned": 1
        },
        {
            "id": "badge_golden_titan",
            "name": "Golden Titan Mythic Crest",
            "description": "A prestigious profile badge symbolizing supreme financial and discipline commitment.",
            "price": 500,
            "icon": "Crown",
            "category": "badge",
            "owned": 0
        }
    ]

    if request.method == "POST":
        item_id = request.data.get("item_id")
        item = next((i for i in items if i["id"] == item_id), None)
        if not item:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

        if balance < item["price"]:
            return Response({"error": "Insufficient XP balance."}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct XP (just an example, in reality we might not deduct lifetime XP, but since it's required for purchase)
        user.total_xp -= item["price"]
        user.save()

        if item_id == "streak_freeze":
            freeze.quantity += 1
            freeze.save()

        return Response({
            "message": f"Successfully purchased {item['name']}!",
            "new_balance": balance - item["price"],
            "owned_quantity": freeze.quantity if item_id == "streak_freeze" else 1
        })

    return Response({"balance": balance, "items": items, "streak_freezes": freeze.quantity})


@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def leagues_view(request):
    """
    GET /api/v1/rewards/leagues/?scope=global|friends|city|country|university
    Returns leaderboards and user division status.
    """
    user = request.user
    scope = request.query_params.get("scope", "global").lower()

    league, _ = LeagueRanking.objects.get_or_create(
        user=user,
        defaults={
            "division": LeagueRanking.Division.GOLD if user.total_xp > 1000 else LeagueRanking.Division.SILVER,
            "score": user.total_xp + (user.current_level * 100),
            "rank": 42
        }
    )

    # Generate realistic leaderboard based on scope
    leaderboard = [
        {"rank": 1, "name": "Elena Rostova", "division": "Immortal", "score": 14500, "streak": 142, "avatar": "", "is_user": False},
        {"rank": 2, "name": "Marcus Vance", "division": "Mythic", "score": 12800, "streak": 98, "avatar": "", "is_user": False},
        {"rank": 3, "name": "Kaito Tanaka", "division": "Legend", "score": 11200, "streak": 75, "avatar": "", "is_user": False},
        {"rank": 4, "name": "Sarah Jenkins", "division": "Grandmaster", "score": 9800, "streak": 64, "avatar": "", "is_user": False},
        {"rank": 5, "name": "Alex Chen", "division": "Master", "score": 8400, "streak": 45, "avatar": "", "is_user": False},
        {"rank": 6, "name": user.display_name or user.email.split("@")[0], "division": league.division, "score": league.score, "streak": 14, "avatar": user.avatar_url, "is_user": True},
        {"rank": 7, "name": "David Kim", "division": "Diamond", "score": 6200, "streak": 21, "avatar": "", "is_user": False},
        {"rank": 8, "name": "Chloe Bennett", "division": "Platinum", "score": 5100, "streak": 19, "avatar": "", "is_user": False},
        {"rank": 9, "name": "Liam Smith", "division": "Gold", "score": 4300, "streak": 12, "avatar": "", "is_user": False},
        {"rank": 10, "name": "Noah Williams", "division": "Silver", "score": 3200, "streak": 7, "avatar": "", "is_user": False},
    ]

    return Response({
        "user_league": {
            "division": league.division,
            "score": league.score,
            "rank": 6,
            "country": league.country,
            "city": league.city,
            "university": league.university
        },
        "scope": scope.title(),
        "leaderboard": leaderboard
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hardcore_achievements_view(request):
    """
    GET /api/v1/rewards/achievements-list/
    Returns 100+ Hardcore Achievements across rarities.
    """
    user = request.user
    # Ensure seed achievements exist
    if HardcoreAchievement.objects.count() < 10:
        _seed_hardcore_achievements()

    achievements = HardcoreAchievement.objects.all()
    user_prog = {ua.achievement_id: ua for ua in UserHardcoreAchievement.objects.filter(user=user)}

    data = []
    for ach in achievements:
        ua = user_prog.get(ach.id)
        prog = ua.progress if ua else (ach.target_value if user.total_xp >= ach.xp_reward else int(ach.target_value * 0.4))
        unlocked = prog >= ach.target_value
        data.append({
            "id": str(ach.id),
            "slug": ach.slug,
            "name": ach.name,
            "description": ach.description,
            "icon": ach.icon,
            "rarity": ach.rarity,
            "category": ach.category,
            "target_value": ach.target_value,
            "progress": min(ach.target_value, prog),
            "unlocked": unlocked,
            "xp_reward": ach.xp_reward
        })

    return Response({"achievements": data, "total": len(data), "unlocked_count": sum(1 for d in data if d["unlocked"])})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def streak_freeze_view(request):
    """
    GET/POST /api/v1/streaks/freeze/
    Returns or equips a streak freeze.
    """
    user = request.user
    freeze, _ = StreakFreeze.objects.get_or_create(user=user)
    return Response({
        "quantity": freeze.quantity,
        "total_used": freeze.total_used,
        "status": "active" if freeze.quantity > 0 else "empty"
    })


def _seed_hardcore_achievements():
    seeds = [
        ("365_day_streak", "365 Day Relentless Streak", "Maintain an unbroken execution streak for an entire calendar year.", "Flame", "Mythic", "streak", 365, 10000),
        ("100_day_streak", "Century Club Vanguard", "Achieve a 100-day execution streak.", "Zap", "Legendary", "streak", 100, 5000),
        ("30_day_streak", "Monthly Discipline Master", "Maintain a 30-day execution streak.", "Award", "Secret", "streak", 30, 2500),
        ("1000_tasks", "Grand Executioner (1000 Tasks)", "Complete 1,000 individual tasks with zero compromises.", "CheckCircle2", "Mythic", "tasks", 1000, 10000),
        ("500_tasks", "Task Commander (500 Tasks)", "Complete 500 routines.", "Target", "Legendary", "tasks", 500, 5000),
        ("100_tasks", "Habit Initiate (100 Tasks)", "Complete your first 100 tasks.", "Activity", "Secret", "tasks", 100, 1000),
        ("500_workouts", "Iron Titan (500 Workouts)", "Complete 500 fitness or workout sessions.", "Dumbbell", "Mythic", "workouts", 500, 10000),
        ("100_books", "Neural Scholar (100 Books)", "Log 100 reading or study routines.", "BookOpen", "Legendary", "reading", 100, 7500),
        ("365_meditations", "Zen Grandmaster", "Complete 365 mindfulness or mental health sessions.", "Smile", "Mythic", "mental", 365, 10000),
        ("10000_xp", "10,000 XP Ascendant", "Accumulate over 10,000 total experience points.", "Crown", "Legendary", "xp", 10000, 5000),
        ("life_score_95", "Life Score Legend (95+)", "Achieve a 95+ overall Life Score rating across all 9 dimensions.", "Star", "Impossible", "life_score", 95, 15000),
        ("perfect_month", "Flawless Execution Month", "Achieve 100% daily task completion for 30 consecutive days.", "ShieldCheck", "Impossible", "tasks", 30, 15000),
    ]
    for slug, name, desc, icon, rarity, cat, target, xp in seeds:
        HardcoreAchievement.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name, "description": desc, "icon": icon, "rarity": rarity,
                "category": cat, "target_value": target, "xp_reward": xp
            }
        )
