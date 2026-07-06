"""
FORGE — Production Middleware
Two pieces:
  1. RequestIDMiddleware — attaches X-Request-ID to every request/response
  2. RequestLoggingMiddleware — structured log line per request for tracing

Usage in settings:
    MIDDLEWARE = [
        "apps.core.middleware.RequestIDMiddleware",
        "apps.core.middleware.RequestLoggingMiddleware",
        ...
    ]
"""
import uuid
import time
import logging

logger = logging.getLogger("forge.requests")


class RequestIDMiddleware:
    """
    Attaches a unique X-Request-ID to every request.
    Echoes it back in the response header.
    Stored on request.id so the renderer can include it in meta.
    """
    HEADER = "HTTP_X_REQUEST_ID"
    RESPONSE_HEADER = "X-Request-ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Honour client-supplied ID (tracing from frontend), generate otherwise
        request_id = request.META.get(self.HEADER) or str(uuid.uuid4())
        request.id = request_id

        response = self.get_response(request)
        response[self.RESPONSE_HEADER] = request_id
        return response


class RequestLoggingMiddleware:
    """
    Emits one structured log line per request.
    Format (JSON-compatible key=value):
      INFO  method=GET path=/api/v1/dashboard/ status=200 duration_ms=34 user=<uuid> request_id=<uuid>

    Skipped for: health checks, static files, admin, media.
    """
    SKIP_PREFIXES = ("/health", "/static", "/media", "/admin", "/favicon")

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info

        # Skip noisy paths
        if any(path.startswith(p) for p in self.SKIP_PREFIXES):
            return self.get_response(request)

        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = round((time.monotonic() - start) * 1000)

        user_id = "anon"
        if hasattr(request, "user") and request.user.is_authenticated:
            user_id = str(request.user.id)

        request_id = getattr(request, "id", "-")

        log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            "method=%s path=%s status=%d duration_ms=%d user=%s request_id=%s",
            request.method,
            path,
            response.status_code,
            duration_ms,
            user_id,
            request_id,
        )

        # Warn on slow requests (>500ms)
        if duration_ms > 500:
            logger.warning(
                "SLOW REQUEST method=%s path=%s duration_ms=%d user=%s",
                request.method, path, duration_ms, user_id,
            )

        return response
