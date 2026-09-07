from django.contrib import admin
from .models import SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ["key", "value", "group", "updated_at"]
    list_filter = ["group"]
    search_fields = ["key"]
