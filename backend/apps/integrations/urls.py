from django.urls import path
from apps.integrations import views

urlpatterns = [
    path("",        views.widget_bundle, name="widget-bundle"),
    path("streak/", views.streak_widget, name="widget-streak"),
]
