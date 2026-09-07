from django.contrib import admin
from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "email", "subject"]
    readonly_fields = ["name", "email", "subject", "message", "created_at"]
