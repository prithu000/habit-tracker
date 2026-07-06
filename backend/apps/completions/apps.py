"""
FORGE — Completions App Config (with signals)
"""
from django.apps import AppConfig


class CompletionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.completions"
    label = "completions"

    def ready(self):
        import apps.completions.signals  # noqa: F401
