from django.db import transaction
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsSubAdminOrSuperAdmin

from .models import SiteSetting
from .serializers import SiteSettingSerializer, check_setting_value


class SiteSettingListView(generics.ListAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = SiteSettingSerializer
    queryset = SiteSetting.objects.all()
    filterset_fields = ["group"]
    pagination_class = None  # Settings are few, no need for pagination


class SiteSettingDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsSubAdminOrSuperAdmin]
    serializer_class = SiteSettingSerializer
    queryset = SiteSetting.objects.all()
    lookup_field = "key"


class SiteSettingBulkUpdateView(APIView):
    """Save several settings in one atomic request, e.g. a settings page's "Save Changes"."""

    permission_classes = [IsSubAdminOrSuperAdmin]

    def patch(self, request):
        payload = request.data.get("settings")
        if not isinstance(payload, list) or not payload:
            raise ValidationError({"settings": "Provide a non-empty list of {key, value} objects."})

        keys = []
        for item in payload:
            if not isinstance(item, dict) or not item.get("key"):
                raise ValidationError({"settings": "Each item must include a 'key'."})
            keys.append(item["key"])
        if len(keys) != len(set(keys)):
            raise ValidationError({"settings": "Duplicate keys in request."})

        existing = {s.key: s for s in SiteSetting.objects.filter(key__in=keys)}
        missing = [k for k in keys if k not in existing]
        if missing:
            raise ValidationError({"settings": f"Unknown setting key(s): {', '.join(missing)}"})

        errors = {}
        for item in payload:
            error = check_setting_value(item["key"], item.get("value", ""))
            if error:
                errors[item["key"]] = error
        if errors:
            raise ValidationError(errors)

        with transaction.atomic():
            updated = []
            for item in payload:
                setting = existing[item["key"]]
                setting.value = (item.get("value") or "").strip()
                setting.save(update_fields=["value", "updated_at"])
                updated.append(setting)

        return Response(SiteSettingSerializer(updated, many=True).data, status=status.HTTP_200_OK)
