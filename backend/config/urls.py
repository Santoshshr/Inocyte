from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/users/", include("apps.accounts.urls_users")),
    path("api/companies/", include("apps.companies.urls")),
    path("api/industries/", include("apps.companies.urls_industries")),
    path("api/inquiries/", include("apps.inquiries.urls")),
    path("api/settings/", include("apps.settings_app.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
