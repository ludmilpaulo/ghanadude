# views.py
from django.shortcuts import render
from .models import AppVersion
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpRequest, HttpResponseRedirect
from django.shortcuts import redirect

def app_redirect_view(request: HttpRequest):
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()

    # Replace these with your actual links
    play_store_url = "https://play.google.com/store/apps/details?id=com.yourapp.package"
    app_store_url = "https://apps.apple.com/app/idYOUR_APPLE_ID"
    android_deep_link = "yourapp://"
    ios_deep_link = "yourapp://"

    if 'android' in user_agent:
        # Attempt to redirect to app, then fallback to Play Store
        return HttpResponseRedirect(f"intent://#Intent;package=com.yourapp.package;scheme=yourapp;end")
    elif 'iphone' in user_agent or 'ipad' in user_agent:
        # iOS: try universal link first (configure Apple App Site Association for full support)
        return HttpResponseRedirect(ios_deep_link)  # You can fallback via meta tags or JS
    else:
        # Fallback to your website or a general page
        return redirect("https://www.ghanadude.com")



@api_view(['GET'])
def get_app_version(request):
    ios = AppVersion.objects.filter(platform='ios').first()
    android = AppVersion.objects.filter(platform='android').first()

    return Response({
        "latest_version": ios.latest_version if ios else "1.0.0",
        "force_update": ios.force_update if ios else True,
        "app_store_url": ios.store_url if ios else "",
        "play_store_url": android.store_url if android else ""
    })


def version_changelog(request):
    versions = AppVersion.objects.all().order_by('-updated_at')
    return render(request, 'changelog.html', {'versions': versions})
