from django.urls import path
from .views import TrackOpenView, TrackClickView
from .webhooks import brevo_webhook

app_name = "emails"

urlpatterns = [
    path('track/open/<int:log_id>/', TrackOpenView.as_view(), name='track_open'),
    path('track/click/<int:log_id>/', TrackClickView.as_view(), name='track_click'),
    path('webhooks/brevo/', brevo_webhook, name='brevo_webhook'),
]
