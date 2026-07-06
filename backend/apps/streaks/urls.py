from django.urls import path
from apps.streaks.views import streaks_view, routine_streak_view

urlpatterns = [
    path("", streaks_view, name="streaks"),
    path("<uuid:routine_id>/", routine_streak_view, name="routine-streak"),
]
