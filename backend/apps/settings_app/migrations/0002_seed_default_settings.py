from django.db import migrations

DEFAULT_SETTINGS = [
    ("site_name", "general", "INOCYTE"),
    ("site_tagline", "general", "Venture Building for a Meaningful Future"),
    ("site_description", "general", ""),
    ("contact_email", "contact", ""),
    ("contact_phone", "contact", ""),
    ("contact_address", "contact", ""),
    ("social_twitter", "social", ""),
    ("social_linkedin", "social", ""),
    ("social_facebook", "social", ""),
    ("social_instagram", "social", ""),
    ("social_youtube", "social", ""),
]


def seed_settings(apps, schema_editor):
    SiteSetting = apps.get_model("settings_app", "SiteSetting")
    for key, group, default_value in DEFAULT_SETTINGS:
        SiteSetting.objects.get_or_create(key=key, defaults={"group": group, "value": default_value})


class Migration(migrations.Migration):

    dependencies = [
        ("settings_app", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_settings, migrations.RunPython.noop),
    ]
