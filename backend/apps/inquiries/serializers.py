from rest_framework import serializers
from .models import ContactInquiry


class InquiryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ["id", "name", "email", "subject", "status", "created_at"]
        read_only_fields = ["id", "created_at"]


class InquiryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ["id", "name", "email", "subject", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "name", "email", "subject", "message", "created_at", "updated_at"]


class InquirySubmitSerializer(serializers.ModelSerializer):
    """Public-facing: anyone can submit a contact inquiry."""

    class Meta:
        model = ContactInquiry
        fields = ["name", "email", "subject", "message"]
