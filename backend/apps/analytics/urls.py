from django.urls import path
from apps.analytics import views

urlpatterns = [
    path("weekly/",           views.weekly_analytics,  name="analytics-weekly"),
    path("monthly/",          views.monthly_analytics, name="analytics-monthly"),
    path("year/",             views.year_analytics,    name="analytics-year"),
    path("heatmap/",          views.heatmap_view,      name="analytics-heatmap"),
    path("heatmap/<str:date_str>/", views.heatmap_day_detail, name="analytics-heatmap-day"),
    path("discipline-score/", views.discipline_score,  name="analytics-discipline-score"),
    path("discipline-dna/",   views.discipline_dna,    name="analytics-dna"),
    path("replay/",           views.monthly_replay,    name="analytics-replay"),
    path("life-tree/",        views.life_tree,         name="analytics-life-tree"),
]
