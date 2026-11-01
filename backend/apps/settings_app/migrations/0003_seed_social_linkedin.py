from django.db import migrations

# The public site has always linked here; seed it so the link survives the switch to
# admin-managed social URLs. Only fills a blank value — never overwrites an admin's edit.
LINKEDIN_URL = "https://www.linkedin.com/company/inocyte"


def seed_linkedin(apps, schema_editor):
    SiteSetting = apps.get_model("settings_app", "SiteSetting")
    setting, _ = SiteSetting.objects.get_or_create(key="social_linkedin", defaults={"group": "social"})
    if not setting.value:
        setting.value = LINKEDIN_URL
        setting.save(update_fields=["value"])


class Migration(migrations.Migration):

    dependencies = [
        ("settings_app", "0002_seed_default_settings"),
    ]

    operations = [
        migrations.RunPython(seed_linkedin, migrations.RunPython.noop),
    ]
