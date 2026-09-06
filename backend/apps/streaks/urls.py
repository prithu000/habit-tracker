from django.urls import path
from apps.streaks.views import streaks_view

urlpatterns = [
    path("", streaks_view, name="streaks"),
]
