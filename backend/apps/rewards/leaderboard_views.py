"""
Arena Top-5 and Global Leaderboard Views
Dynamically computes rank and titles live on query time without persisting rank.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.rewards.models import LeaderboardTitle

User = get_user_model()


@api_view(["GET"])
@permission_classes([AllowAny])
def arena_leaderboard_view(request):
    """
    GET /api/v1/arena/leaderboard/?limit=5
    Returns top users ranked by lifetime XP (total_xp) descending.
    Titles and ranks are computed dynamically on every request from LeaderboardTitle.
    """
    # Parse and clamp limit (default 5, min 1, max 50)
    try:
        limit = int(request.query_params.get("limit", 5))
        limit = max(1, min(limit, 50))
    except (ValueError, TypeError):
        limit = 5

    # Fetch top users who are active and permitted on leaderboard
    users = (
        User.objects.filter(is_active=True, show_on_leaderboard=True)
        .order_by("-total_xp", "-date_joined")[:limit]
    )

    # Load titles into dictionary keyed by rank_position
    titles_by_rank = {
        lt.rank_position: lt
        for lt in LeaderboardTitle.objects.all()
    }

    is_staff_user = bool(request.user and request.user.is_authenticated and request.user.is_staff)

    results = []
    for idx, user in enumerate(users):
        rank = idx + 1
        title_obj = titles_by_rank.get(rank)

        # Fallback for display username
        clean_username = user.username.strip() if user.username else ""
        if not clean_username:
            clean_username = user.display_name.strip() if user.display_name else user.email.split("@")[0]

        entry = {
            "rank": rank,
            "username": clean_username,
            "display_name": user.display_name or clean_username,
            "lifetime_xp": user.total_xp,
            "title_name": title_obj.title_name if title_obj else None,
            "description": title_obj.description if title_obj else "",
        }

        # Include is_seed only for staff / admin users for auditing
        if is_staff_user:
            entry["is_seed"] = user.is_seed

        results.append(entry)

    return Response({
        "status": "success",
        "count": len(results),
        "limit": limit,
        "leaderboard": results,
    })
