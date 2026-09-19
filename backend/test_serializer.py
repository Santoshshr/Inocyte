import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.companies.serializers import CompanyDetailSerializer
from django.core.files.uploadedfile import SimpleUploadedFile

data = {
    "name": "Test Company",
    "tagline": "",
    "description": "",
    "status": "upcoming",
    "website_url": "",
    "display_order": "0",
    "is_featured": "false"
}
serializer = CompanyDetailSerializer(data=data)
if not serializer.is_valid():
    print(serializer.errors)
else:
    print("Valid!")
