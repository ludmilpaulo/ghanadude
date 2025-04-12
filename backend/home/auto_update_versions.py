# tasks/auto_update_versions.py
import requests
import play_scraper
from .models import AppVersion
from .check_store_versions import notify_admin_if_new_version_detected


def auto_update_store_versions():
    result = {}

    # 🔹 iOS (using Apple Lookup API)
    ios_app_id = "YOUR_APP_ID"  # Replace this!
    ios_lookup_url = f"https://itunes.apple.com/lookup?id={ios_app_id}"
    ios_response = requests.get(ios_lookup_url).json()
    if ios_response.get("resultCount") > 0:
        ios_data = ios_response["results"][0]
        ios_version = ios_data.get("version")
        ios_url = ios_data.get("trackViewUrl")
        result["ios"] = {"latest_version": ios_version, "store_url": ios_url}

    # 🔹 Android (Google Play)
    android_pkg = "com.ludmil.ghanadudemobile"
    try:
        android = play_scraper.details(android_pkg)
        android_version = android.get("current_version")
        android_url = android.get("url")
        result["android"] = {
            "latest_version": android_version,
            "store_url": android_url,
        }
    except Exception as e:
        print("Failed to fetch Android version:", e)

    # 🔄 Save + notify if changed
    for platform, data in result.items():
        AppVersion.objects.update_or_create(
            platform=platform,
            defaults={
                "latest_version": data["latest_version"],
                "store_url": data["store_url"],
            },
        )

    # ✉️ Email admins if versions changed
    notify_admin_if_new_version_detected(result)
