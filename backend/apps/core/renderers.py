from rest_framework.renderers import JSONRenderer


class ApiRenderer(JSONRenderer):
    """Wraps all successful responses in a consistent envelope."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        if response and response.status_code >= 400:
            # Error responses are already structured by exception handler
            return super().render(data, accepted_media_type, renderer_context)

        # Paginated responses already have their own structure
        if isinstance(data, dict) and "results" in data:
            envelope = {
                "status": "success",
                "data": data["results"],
                "count": data.get("count"),
                "next": data.get("next"),
                "previous": data.get("previous"),
            }
        else:
            envelope = {
                "status": "success",
                "data": data,
            }

        return super().render(envelope, accepted_media_type, renderer_context)
