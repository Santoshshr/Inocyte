from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.core.models import BaseModel


class Industry(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "Industries"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Company(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        UPCOMING = "upcoming", "Upcoming"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.UPCOMING, db_index=True
    )
    industry = models.ForeignKey(
        Industry, on_delete=models.SET_NULL, null=True, blank=True, related_name="companies"
    )
    website_url = models.URLField(blank=True)
    logo = models.ImageField(upload_to="companies/logos/", blank=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_companies",
    )

    class Meta:
        ordering = ["display_order", "-created_at"]
        verbose_name_plural = "Companies"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
