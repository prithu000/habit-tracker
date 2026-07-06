from django.urls import path
from apps.analytics.dashboard import dashboard_view

urlpatterns = [
    path("", dashboard_view, name="dashboard"),
]
