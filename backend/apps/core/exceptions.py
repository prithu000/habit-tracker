"""
FORGE — Custom Exception Hierarchy
All API errors are mapped to these domain exceptions.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class ForgeBaseException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An error occurred."
    default_code = "forge_error"


class ValidationError(ForgeBaseException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "Validation failed."
    default_code = "validation_error"


class NotFoundError(ForgeBaseException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Resource not found."
    default_code = "not_found"


class PermissionDeniedError(ForgeBaseException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Permission denied."
    default_code = "permission_denied"


class ConflictError(ForgeBaseException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Resource conflict."
    default_code = "conflict"


class RateLimitError(ForgeBaseException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = "Rate limit exceeded. Please slow down."
    default_code = "rate_limit"


class ServiceUnavailableError(ForgeBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporarily unavailable."
    default_code = "service_unavailable"


class TaskAlreadyCompletedError(ConflictError):
    default_detail = "This task has already been completed today."
    default_code = "task_already_completed"


class OnboardingRequiredError(ForgeBaseException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Onboarding must be completed before using this feature."
    default_code = "onboarding_required"


class InvalidStreakOperationError(ValidationError):
    default_detail = "Invalid streak operation."
    default_code = "invalid_streak_operation"
