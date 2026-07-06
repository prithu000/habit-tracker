from django.urls import path
from apps.notifications import views

urlpatterns = [
    path("",               views.notification_list, name="notification-list"),
    path("count/",         views.notification_count, name="notification-count"),
    path("mark-all-read/", views.mark_all_read, name="notification-mark-all-read"),
    path("<uuid:notification_id>/read/", views.mark_read, name="notification-mark-read"),
]
