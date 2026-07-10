"""
FORGE — Django Base Settings
"""
import os
from pathlib import Path
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="dev-secret-key-change-in-production")

DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=lambda v: [s.strip() for s in v.split(",")])

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.core",
    "apps.users",
    "apps.routines",
    "apps.completions",
    "apps.streaks",
    "apps.analytics",
    "apps.rewards",
    "apps.notifications",
    "apps.integrations",
    "apps.subscriptions",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    # Request ID must be first — renderer reads request.id
    "apps.core.middleware.RequestIDMiddleware",
    "apps.core.middleware.RequestLoggingMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database — pgBouncer compatible (CONN_MAX_AGE=0 for transaction-mode pooling)
# For production, use pgBouncer with transaction-mode pooling.
# Set CONN_MAX_AGE=0 so Django doesn't hold connections between requests.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="forge_db"),
        "USER": config("DB_USER", default="forge_user"),
        "PASSWORD": config("DB_PASSWORD", default="forge_password"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
        # CONN_MAX_AGE=0 is required when using pgBouncer in transaction-mode.
        # Set to 600 ONLY if using session-mode pooling or direct connections.
        "CONN_MAX_AGE": config("DB_CONN_MAX_AGE", default=0, cast=int),
        "CONN_HEALTH_CHECKS": True,
        "OPTIONS": {
            "connect_timeout": 10,
            "options": r"-c default_transaction_isolation=read\ committed",
        },
        "TEST": {
            "NAME": "test_forge_db",
        },
    }
}

# Cache — Redis with key prefix and connection pool
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("REDIS_URL", default="redis://localhost:6379/1"),
        "KEY_PREFIX": "forge",
        "VERSION": 1,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 2,
            "SOCKET_TIMEOUT": 2,
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 100,
            },
            # Compress values over 10KB to save Redis memory
            "COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor",
            "IGNORE_EXCEPTIONS": True,  # Never fail a request due to Redis being down
        },
    },
    # Separate DB for session (prevents cache eviction from clearing sessions)
    "session": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("REDIS_SESSION_URL", default="redis://localhost:6379/2"),
        "KEY_PREFIX": "forge_sess",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": False,  # Sessions must always work
        },
    },
}

# Use Redis for sessions (not cookies)
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "session"

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─────────────────────────────────────────────
# Django REST Framework
# ─────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.CursorPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": [
        "apps.core.renderers.ForgeJSONRenderer",
    ],
    "EXCEPTION_HANDLER": "apps.core.exception_handler.forge_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "30/minute",
        # Write-heavy endpoints (completion, undo) — low limit
        "completion": "120/minute",
        # Read-heavy dashboard/analytics — higher limit
        "user": "300/minute",
        # Auth endpoints — strictest
        "auth": "10/minute",
    },
    # Disable ATOMIC_REQUESTS globally — we manage transactions explicitly
    # to avoid long-held DB connections on read endpoints
    "NON_FIELD_ERRORS_KEY": "errors",
}

# ─────────────────────────────────────────────
# JWT
# ─────────────────────────────────────────────
SIMPLE_JWT = {
    # 30 min access token reduces refresh storms vs 15 min
    # At 500k users × 4 refreshes/hour = 33M/day saved at 30 min vs 15 min
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,  # Avoids a DB write on every token validation
    "ALGORITHM": "HS256",
    "SIGNING_KEY": config("JWT_SECRET", default=SECRET_KEY),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "TOKEN_OBTAIN_SERIALIZER": "apps.users.serializers.ForgeTokenObtainPairSerializer",
}

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000",
    cast=lambda v: [s.strip() for s in v.split(",")],
)
CORS_ALLOW_CREDENTIALS = True

# ─────────────────────────────────────────────
# Celery
# ─────────────────────────────────────────────
CELERY_BROKER_URL = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_BEAT_SCHEDULE = {
    "daily-streak-evaluation": {
        "task": "workers.tasks.streak_engine.evaluate_all_streaks",
        "schedule": 60 * 60,  # every hour
    },
    "daily-analytics-rollup": {
        "task": "workers.tasks.analytics_rollup.run_daily_rollup",
        "schedule": 60 * 60 * 24,  # every 24 hours
    },
    "weekly-insight-generation": {
        "task": "workers.tasks.analytics_rollup.generate_weekly_insights",
        "schedule": 60 * 60 * 24 * 7,  # every week
    },
    # Cache management
    "midnight-dashboard-cache-invalidation": {
        "task": "workers.tasks.cache_management.invalidate_all_dashboard_caches",
        "schedule": 60 * 60 * 24,  # midnight UTC
    },
    "post-rollup-analytics-cache-invalidation": {
        "task": "workers.tasks.cache_management.invalidate_analytics_caches_after_rollup",
        "schedule": 60 * 60 * 24 + 300,  # 5 minutes after rollup
    },
    "leaderboard-cache-refresh": {
        "task": "workers.tasks.cache_management.refresh_leaderboard_cache",
        "schedule": 60 * 3,  # every 3 minutes
    },
}

# ─────────────────────────────────────────────
# API Docs (drf-spectacular)
# ─────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "YOU VS YOU API",
    "DESCRIPTION": (
        "YOU VS YOU Personal Operating System — API.\n\n"
        "**Authentication**: All endpoints except `/auth/register/` and `/auth/login/` "
        "require a Bearer JWT token in the Authorization header.\n\n"
        "**Response format**: All responses are enveloped:\n"
        "```json\n"
        '{ "data": <payload>, "meta": { "status": 200 }, "error": null }\n'
        "```\n"
        "Errors include `code`, `message`, and `errors` (field-level) keys."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1/",
    "COMPONENT_SPLIT_REQUEST": True,
    "SORT_OPERATIONS": False,
    "TAGS": [
        {"name": "Auth", "description": "Registration, login, logout, token refresh"},
        {"name": "Users", "description": "Profile, onboarding, password management"},
        {"name": "Routines", "description": "Routine CRUD and task management"},
        {"name": "Today", "description": "Daily task completion and undo"},
        {"name": "Dashboard", "description": "Aggregated dashboard data (primary frontend endpoint)"},
        {"name": "Analytics", "description": "Weekly, monthly, and yearly analytics"},
        {"name": "Rewards", "description": "XP history, badges, and leaderboard"},
        {"name": "Widgets", "description": "Sidebar widget data"},
        {"name": "Notifications", "description": "In-app notification management"},
    ],
}

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {name} {message}",
            "style": "{",
        },
        "simple": {
            "format": "[{levelname}] {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        # Request-level access log (from RequestLoggingMiddleware)
        "forge.requests": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        # Service layer (XP, streaks, achievements)
        "services": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        # Django internals — only warnings and up
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
        },
        # Celery tasks
        "celery": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}


# ─────────────────────────────────────────────
# Email
# ─────────────────────────────────────────────
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="").replace(" ", "")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@youvsyou.com")

# Google OAuth
GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", default="")

# ─────────────────────────────────────────────
# Razorpay Payment Gateway (Environment Variables Only)
# ─────────────────────────────────────────────
RAZORPAY_KEY_ID = config("RAZORPAY_KEY_ID", default="")
RAZORPAY_KEY_SECRET = config("RAZORPAY_KEY_SECRET", default="")
RAZORPAY_WEBHOOK_SECRET = config("RAZORPAY_WEBHOOK_SECRET", default="")

