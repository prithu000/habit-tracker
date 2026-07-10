"""
FORGE — URL Configuration (Production)
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    """Health check for load balancers and monitoring."""
    return JsonResponse({"status": "healthy", "service": "forge-api", "version": "1.0.0"})


# Customize admin site
admin.site.site_header = "FORGE Admin"
admin.site.site_title = "FORGE"
admin.site.index_title = "FORGE Operations Dashboard"

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),


    # ── API v1 ──
    path("api/v1/auth/",          include("apps.users.urls.auth")),
    path("api/v1/users/",         include("apps.users.urls.users")),
    path("api/v1/routines/",      include("apps.routines.urls")),
    path("api/v1/today/",         include("apps.completions.urls")),
    path("api/v1/streaks/",       include("apps.streaks.urls")),
    path("api/v1/analytics/",     include("apps.analytics.urls")),
    path("api/v1/rewards/",       include("apps.rewards.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/widgets/",       include("apps.integrations.urls")),
    path("api/v1/subscriptions/", include("apps.subscriptions.urls")),
    path("api/v1/subscription/",  include("apps.subscriptions.urls")),
    path("api/v1/payments/",      include("apps.subscriptions.urls")),
    path("api/subscriptions/",    include("apps.subscriptions.urls")),
    path("api/subscription/",     include("apps.subscriptions.urls")),
    path("api/payments/",         include("apps.subscriptions.urls")),
    # Dashboard aggregation (primary frontend endpoint)
    path("api/v1/dashboard/",     include("apps.analytics.dashboard_urls")),
    # Additive OS features
    path("api/v1/",               include("config.os_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

