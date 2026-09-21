import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import DatabaseError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Return errors in a consistent { status, message, errors } format."""
    response = exception_handler(exc, context)

    if response is None:
        if isinstance(exc, Http404):
            return Response({"status": "error", "message": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
        if isinstance(exc, PermissionDenied):
            return Response({"status": "error", "message": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        if isinstance(exc, (DatabaseError, DjangoValidationError)):
            logger.exception("Database/validation error: %s", exc)
            return Response({"status": "error", "message": "The server is temporarily unavailable. Please try again later."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        logger.exception("Unhandled exception: %s", exc)
        return Response({"status": "error", "message": "An unexpected server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    errors = response.data

    # DRF returns either a dict of field errors or a list
    if isinstance(errors, dict):
        detail = errors.pop("detail", None)
        message = str(detail) if detail else "Validation error."
        error_body = errors if errors else None
    elif isinstance(errors, list):
        message = str(errors[0]) if errors else "An error occurred."
        error_body = None
    else:
        message = str(errors)
        error_body = None

    response.data = {
        "status": "error",
        "message": message,
    }
    if error_body:
        response.data["errors"] = error_body

    return response
