from rest_framework import serializers
from .models import Company, Industry


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ["id", "name", "slug", "display_order", "is_active", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class CompanyListSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source="industry.name", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)

    class Meta:
        model = Company
        fields = [
            "id", "name", "slug", "tagline", "status", "industry", "industry_name",
            "website_url", "logo", "display_order", "is_featured",
            "created_by", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_by", "created_at", "updated_at"]


class CompanyDetailSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source="industry.name", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)

    class Meta:
        model = Company
        fields = [
            "id", "name", "slug", "tagline", "description", "status",
            "industry", "industry_name", "website_url", "logo",
            "display_order", "is_featured",
            "created_by", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_by", "created_at", "updated_at"]
