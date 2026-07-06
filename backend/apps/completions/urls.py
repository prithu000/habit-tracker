from django.urls import path
from apps.completions.views import (
    today_view,
    CompleteTaskView,
    undo_completion,
    completion_history,
)

urlpatterns = [
    path("", today_view, name="today"),
    path("complete/", CompleteTaskView.as_view(), name="complete-task"),
    path("complete/<uuid:completion_id>/", undo_completion, name="undo-completion"),
    path("history/", completion_history, name="completion-history"),
]
