from django.contrib.auth.password_validation import validate_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q
from decouple import config

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create the initial Superadmin from environment variables without overwriting one."

    def handle(self, *args, **options):
        if User.objects.filter(role=User.Role.SUPERADMIN).exists():
            self.stdout.write(self.style.WARNING("A Superadmin already exists; no account was changed."))
            return

        name = config("SUPERADMIN_NAME", default="").strip()
        email = config("SUPERADMIN_EMAIL", default="").strip().lower()
        password = config("SUPERADMIN_PASSWORD", default="")
        if not name or not email or not password:
            raise CommandError(
                "SUPERADMIN_NAME, SUPERADMIN_EMAIL, and SUPERADMIN_PASSWORD are required."
            )

        name_parts = name.split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        try:
            validate_password(password)
        except Exception as exc:
            raise CommandError(str(exc)) from exc

        if User.objects.filter(Q(email__iexact=email)).exists():
            raise CommandError("A user with SUPERADMIN_EMAIL already exists but is not a Superadmin.")

        with transaction.atomic():
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
        self.stdout.write(self.style.SUCCESS(f"Created Superadmin {email}."))
