from django.db import models
from apps.core.models import BaseModel


class SiteSetting(BaseModel):
    class Group(models.TextChoices):
        GENERAL = "general", "General"
        CONTACT = "contact", "Contact"
        SOCIAL = "social", "Social"

    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField(blank=True)
    group = models.CharField(max_length=10, choices=Group.choices, default=Group.GENERAL)

    class Meta:
        ordering = ["group", "key"]

    def __str__(self):
        return f"{self.group}:{self.key}"
