"""
FORGE — Exception Handler
Formats all DRF exceptions into the standard FORGE envelope.

Error response contract (never changes):
{
  "data": null,
  "meta": { "status": 422 },
  "error": {
    "code": "validation_error",
    "message": "Validation failed.",
    "errors": { "email": ["This field is required."] }  ← field-level, always present
  }
}

Frontend rule: always check `error.errors` for field-level detail.
`error.message` is the human-readable summary. `error.code` is machine-readable.
"""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def forge_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None:
        raw = response.data
        code = "error"
        message = "An error occurred."
        errors = {}

        if isinstance(raw, dict):
            # DRF validation errors: { field: [msgs] } or { detail: msg, code: code }
            if "detail" in raw:
                # Auth errors, permission errors, etc.
                detail = raw["detail"]
                message = str(detail)
                code = getattr(detail, "code", raw.get("code", "error"))
            else:
                # Field-level validation errors — preserve structure exactly
                code = "validation_error"
                message = "Validation failed. Check the errors field for details."
                errors = {
                    field: [str(e) for e in errs] if isinstance(errs, list) else [str(errs)]
                    for field, errs in raw.items()
                }
        elif isinstance(raw, list):
            # Non-field errors: [{ "message": "...", "code": "..." }]
            code = "validation_error"
            message = raw[0].get("message", str(raw[0])) if raw else "Validation failed."
            errors = {"non_field_errors": [str(e) for e in raw]}
        else:
            message = str(raw)

        response.data = {
            "data": None,
            "meta": {"status": response.status_code},
            "error": {
                "code": str(code),
                "message": message,
                "errors": errors,
            },
        }
        return response

    # Unhandled exception — log and return generic 500
    logger.exception(
        "Unhandled exception in view: %s | path=%s",
        exc,
        context.get("request", {}).path if hasattr(context.get("request", {}), "path") else "unknown",
    )
    return Response(
        {
            "data": None,
            "meta": {"status": 500},
            "error": {
                "code": "internal_error",
                "message": "An unexpected error occurred. Please try again.",
                "errors": {},
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
