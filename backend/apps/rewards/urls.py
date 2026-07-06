from django.urls import path
from apps.rewards import views

urlpatterns = [
    path("xp/",              views.xp_history,       name="xp-history"),
    path("xp/summary/",      views.xp_summary,       name="xp-summary"),
    path("badges/",          views.badge_list,        name="badge-list"),
    path("badges/mark-seen/", views.mark_badges_seen, name="badges-mark-seen"),
    path("league/",          views.discipline_league, name="discipline-league"),
]
