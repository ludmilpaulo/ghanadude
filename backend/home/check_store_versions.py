# tasks/check_store_versions.py
from django.core.mail import mail_admins
from .models import AppVersion


def notify_admin_if_new_version_detected(latest_versions: dict):
    for platform, version_data in latest_versions.items():
        app_version = AppVersion.objects.filter(platform=platform).first()
        if app_version and app_version.latest_version != version_data["latest_version"]:
            # Send email to admins
            mail_admins(
                subject=f"[App Update] New {platform.upper()} version detected",
                message=(
                    f"New version detected for {platform}:\n"
                    f"Current: {app_version.latest_version}\n"
                    f"New: {version_data['latest_version']}\n"
                    f"URL: {version_data['store_url']}"
                ),
            )
