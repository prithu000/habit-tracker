from django.urls import path
from apps.users.views.user_views import (
    MeView,
    user_stats_view,
    OnboardingCompleteView,
    PasswordChangeView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("me/stats/", user_stats_view, name="user-stats"),
    path("me/password/", PasswordChangeView.as_view(), name="user-password-change"),
    path("me/onboarding/complete/", OnboardingCompleteView.as_view(), name="onboarding-complete"),
]
