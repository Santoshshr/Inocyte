from django.db import models
from apps.core.models import BaseModel


class ContactInquiry(BaseModel):
    class Status(models.TextChoices):
        NEW = "new", "New"
        READ = "read", "Read"
        REPLIED = "replied", "Replied"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300, blank=True)
    message = models.TextField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.NEW, db_index=True
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Contact Inquiries"

    def __str__(self):
        return f"{self.name} — {self.subject or 'No subject'}"
