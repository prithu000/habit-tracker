from django.urls import re_path
from apps.rewards.leaderboard_views import arena_leaderboard_view

urlpatterns = [
    re_path(r"^leaderboard/?$", arena_leaderboard_view, name="arena-leaderboard"),
]
