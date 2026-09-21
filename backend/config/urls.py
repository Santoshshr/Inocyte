from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("Inocyte_Admin_Panel/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/users/", include("apps.accounts.urls_users")),
    path("api/companies/", include("apps.companies.urls")),
    path("api/industries/", include("apps.companies.urls_industries")),
    path("api/inquiries/", include("apps.inquiries.urls")),
    path("api/settings/", include("apps.settings_app.urls")),
]

from django.urls import re_path
from django.views.static import serve

# Always serve media files (no external media CDN configured yet)
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
