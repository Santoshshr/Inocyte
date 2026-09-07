from django.contrib import admin
from .models import Company, Industry


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "is_active"]
    list_editable = ["display_order", "is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "industry", "display_order", "is_featured", "created_at"]
    list_filter = ["status", "is_featured", "industry"]
    search_fields = ["name", "tagline"]
    list_editable = ["display_order", "is_featured"]
    prepopulated_fields = {"slug": ("name",)}
    raw_id_fields = ["created_by"]
