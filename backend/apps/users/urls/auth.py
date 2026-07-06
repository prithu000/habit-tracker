from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views.auth_views import RegisterView, ForgeTokenObtainPairView, logout_view

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", ForgeTokenObtainPairView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", logout_view, name="auth-logout"),
]
