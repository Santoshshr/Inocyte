from django.urls import path
from .views import PublicSocialLinksView, SiteSettingBulkUpdateView, SiteSettingDetailView, SiteSettingListView

urlpatterns = [
    path("", SiteSettingListView.as_view(), name="setting-list"),
    path("public/", PublicSocialLinksView.as_view(), name="setting-public-social"),
    path("bulk-update/", SiteSettingBulkUpdateView.as_view(), name="setting-bulk-update"),
    path("<str:key>/", SiteSettingDetailView.as_view(), name="setting-detail"),
]
