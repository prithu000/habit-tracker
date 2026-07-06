from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.routines.views import RoutineViewSet

router = DefaultRouter()
router.register(r"", RoutineViewSet, basename="routines")

urlpatterns = [
    path("", include(router.urls)),
]
