"""
FORGE — JSON Renderer
Wraps all responses in the standard envelope:
  { "data": <payload>, "meta": { "status": 200, "request_id": "..." }, "error": null }

Error responses (already enveloped by exception_handler):
  { "data": null, "meta": { "status": 422 }, "error": { "code": "...", "errors": {...} } }

Critical: must not double-wrap responses that are already in envelope format.
"""
from rest_framework.renderers import JSONRenderer


class ForgeJSONRenderer(JSONRenderer):

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None
        request = renderer_context.get("request") if renderer_context else None
        status_code = response.status_code if response else 200

        # If the exception handler already produced an envelope, pass through.
        # Detection: envelope has exactly {"data", "meta", "error"} keys.
        if isinstance(data, dict) and set(data.keys()) == {"data", "meta", "error"}:
            return super().render(data, accepted_media_type, renderer_context)

        request_id = getattr(request, "id", None) if request else None

        is_error = status_code >= 400
        envelope = {
            "data": None if is_error else data,
            "meta": {
                "status": status_code,
                **({"request_id": request_id} if request_id else {}),
            },
            "error": data if is_error else None,
        }
        return super().render(envelope, accepted_media_type, renderer_context)
