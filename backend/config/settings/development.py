from .base import *

DEBUG = True

# Use SQLite for quick local dev without PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Use in-memory cache during development (no Redis required)
# Both 'default' and 'session' MUST be defined because base.py sets SESSION_CACHE_ALIAS = "session"
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "forge-dev-cache",
    },
    "session": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "forge-dev-session-cache",
    },
}

# Celery — run tasks eagerly in development (no broker or Redis needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"

INSTALLED_APPS += ["django_extensions"]

# CORS — allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True
