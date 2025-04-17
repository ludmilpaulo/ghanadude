# views.py
from django.shortcuts import render, get_object_or_404
from .models import AppVersion  # adjust import if AppVersion is elsewhere

def deep_link_redirect(request, product_id):
    user_agent = request.META.get("HTTP_USER_AGENT", "").lower()

    is_android = "android" in user_agent
    is_ios = any(kw in user_agent for kw in ["iphone", "ipad", "ipod"])

    # Fetch fallback store URL from AppVersion model
    android_app = AppVersion.objects.filter(platform="android").first()
    ios_app = AppVersion.objects.filter(platform="ios").first()

    context = {
        "product_id": product_id,
        "is_android": is_android,
        "is_ios": is_ios,
        "android_store_url": android_app.store_url if android_app else "https://play.google.com",
        "ios_store_url": ios_app.store_url if ios_app else "https://apps.apple.com",
        "fallback_url": f"https://ghanadude.co.za/product/{product_id}",
    }

    return render(request, "deeplink_redirect.html", context)