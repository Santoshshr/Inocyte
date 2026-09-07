from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator, validate_email
from rest_framework import serializers

from .models import SiteSetting


def check_setting_value(key: str, value: str) -> str | None:
    """Return an error message if value is invalid for this setting key, else None."""
    value = (value or "").strip()
    if not value:
        return None  # settings are optional — blank is always allowed
    if key.endswith("_email"):
        try:
            validate_email(value)
        except DjangoValidationError:
            return f"'{value}' is not a valid email address."
    elif key.startswith("social_") or key.endswith("_url"):
        try:
            URLValidator(schemes=["http", "https"])(value)
        except DjangoValidationError:
            return f"'{value}' is not a valid URL."
    return None


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ["id", "key", "value", "group", "updated_at"]
        read_only_fields = ["id", "key", "updated_at"]

    def validate_value(self, value):
        key = self.instance.key if self.instance else None
        error = check_setting_value(key, value) if key else None
        if error:
            raise serializers.ValidationError(error)
        return value
