from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Return errors in a consistent { status, message, errors } format."""
    response = exception_handler(exc, context)

    if response is None:
        return response

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
