"""
FORGE — Rewards App Views (Production)
XP History, Badge catalog, Achievement details, Leaderboard.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import HasPremiumAccessPermission
from django.db.models import Sum, Count, Q
from datetime import date
from drf_spectacular.utils import extend_schema


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def xp_history(request):
    """
    GET /api/v1/rewards/xp/
    Full XP transaction history with pagination.
    """
    from apps.rewards.models import XPTransaction
    from apps.core.pagination import ForgeCursorPagination

    qs = XPTransaction.objects.filter(
        user=request.user
    ).order_by("-created_at")

    paginator = ForgeCursorPagination()
    page = paginator.paginate_queryset(qs, request)

    data = [
        {
            "id": str(tx.id),
            "amount": tx.amount,
            "reason": tx.reason,
            "metadata": tx.metadata,
            "created_at": tx.created_at.isoformat(),
        }
        for tx in page
    ]

    return paginator.get_paginated_response(data)


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def xp_summary(request):
    """GET /api/v1/rewards/xp/summary/"""
    from apps.rewards.models import XPTransaction
    from services.xp_service import XPService, LEVEL_THRESHOLDS

    user = request.user

    # Last 30 days
    from datetime import timedelta
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_xp = XPTransaction.objects.filter(
        user=user,
        created_at__date__gte=thirty_days_ago,
        amount__gt=0,
    ).aggregate(total=Sum("amount"))["total"] or 0

    # Breakdown by reason
    breakdown = (
        XPTransaction.objects.filter(user=user, amount__gt=0)
        .values("reason")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("-total")
    )

    return Response({
        "total_xp": user.total_xp,
        "current_level": user.current_level,
        "level_title": XPService.get_level_title(user.current_level),
        "level_progress": user.get_level_progress(),
        "xp_to_next_level": XPService.get_xp_to_next_level(user.total_xp, user.current_level),
        "xp_last_30_days": recent_xp,
        "breakdown_by_reason": list(breakdown),
    })


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def badge_list(request):
    """
    GET /api/v1/rewards/badges/?earned=true|false&rarity=legendary
    Lists all badges: earned + locked.
    """
    from apps.rewards.models import Badge, UserBadge
    from services.achievement_engine import BADGE_CATALOG

    user = request.user
    earned_filter = request.query_params.get("earned")
    rarity_filter = request.query_params.get("rarity")

    earned_map = {
        ub.badge.slug: ub
        for ub in UserBadge.objects.filter(user=user).select_related("badge")
    }

    result = []
    for rule in BADGE_CATALOG:
        slug = rule["slug"]
        ub = earned_map.get(slug)
        is_earned = ub is not None

        if earned_filter == "true" and not is_earned:
            continue
        if earned_filter == "false" and is_earned:
            continue
        if rarity_filter and rule["rarity"] != rarity_filter:
            continue

        result.append({
            "slug": slug,
            "name": rule["name"],
            "description": rule["description"],
            "icon": rule["icon"],
            "rarity": rule["rarity"],
            "xp_reward": rule["xp_reward"],
            "is_earned": is_earned,
            "earned_at": ub.created_at.isoformat() if ub else None,
            "seen": ub.seen if ub else None,
        })

    return Response({
        "total_badges": len(BADGE_CATALOG),
        "earned_count": len(earned_map),
        "badges": result,
    })


@extend_schema(request=None, responses=None)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_badges_seen(request):
    """POST /api/v1/rewards/badges/mark-seen/"""
    from apps.rewards.models import UserBadge
    UserBadge.objects.filter(user=request.user, seen=False).update(seen=True)
    return Response({"detail": "Badges marked as seen."})


@extend_schema(responses=None)
@api_view(["GET"])
@permission_classes([IsAuthenticated, HasPremiumAccessPermission])
def discipline_league(request):
    """
    GET /api/v1/rewards/league/
    Anonymous global ranking + user's personal history.
    """
    from apps.rewards.models import XPTransaction
    from apps.completions.models import DayLog
    from apps.streaks.models import StreakRecord
    from django.contrib.auth import get_user_model
    from django.db.models import Sum, Avg
    from datetime import timedelta

    User = get_user_model()
    user = request.user

    today = date.today()
    month_start = today.replace(day=1)

    # Current month XP for all users
    monthly_xp = (
        XPTransaction.objects.filter(
            created_at__date__gte=month_start,
            amount__gt=0,
        )
        .values("user_id")
        .annotate(total_xp=Sum("amount"))
        .order_by("-total_xp")[:100]
    )

    user_xp_map = {str(e["user_id"]): e["total_xp"] for e in monthly_xp}
    user_ids = [e["user_id"] for e in monthly_xp]

    # User's rank
    user_id_str = str(user.id)
    user_monthly_xp = user_xp_map.get(user_id_str, 0)
    user_rank = next(
        (i + 1 for i, uid in enumerate(user_ids) if str(uid) == user_id_str), None
    )
    total_participants = len(user_ids)
    percentile = round(100 - ((user_rank / total_participants) * 100), 1) if user_rank else None

    # Current streak
    streak_record = StreakRecord.objects.filter(user=user, routine__isnull=True).first()
    current_streak = streak_record.current_streak if streak_record else 0

    # Anonymous top-10 ranking (masked, no identifiable info)
    leaderboard = []
    for i, entry in enumerate(monthly_xp[:10]):
        uid = str(entry["user_id"])
        is_self = uid == user_id_str
        streak = StreakRecord.objects.filter(user_id=entry["user_id"], routine__isnull=True).first()
        leaderboard.append({
            "rank": i + 1,
            "is_self": is_self,
            "label": f"#{i + 1}" if not is_self else "You",
            "monthly_xp": entry["total_xp"],
            "current_streak": streak.current_streak if streak else 0,
        })

    return Response({
        "season": f"{today.strftime('%B')} {today.year}",
        "your_rank": {
            "rank": user_rank,
            "percentile": percentile,
            "monthly_xp": user_monthly_xp,
            "current_streak": current_streak,
        },
        "leaderboard": leaderboard,
        "total_participants": total_participants,
    })
