from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpRequest, HttpResponseRedirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.decorators import permission_classes

from account.models import UserProfile

from .serializers import SiteSettingSerializer

from .models import AppVersion, SiteSetting


from django.shortcuts import render

def privacy_policy_view(request):
    return render(request, "privacy.html")

def app_redirect_view(request: HttpRequest):
    user_agent = request.META.get("HTTP_USER_AGENT", "").lower()

    play_store_url = (
        "https://play.google.com/store/apps/details?id=com.ludmil.ghanadudemobile"
    )
    app_store_url = "https://apps.apple.com/us/app/ghanadude-clothing-co/id6743671049"
    android_package = "com.ludmil.ghanadudemobile"
    ios_deep_link = "ghanadude://"

    if "android" in user_agent:
        # Redirect using intent with fallback to Play Store
        return HttpResponseRedirect(
            f"intent://#Intent;package={android_package};scheme=ghanadude;S.browser_fallback_url={play_store_url};end"
        )
    elif "iphone" in user_agent or "ipad" in user_agent:
        # Try iOS deep link; fallback can be handled in app or via universal link setup
        return HttpResponseRedirect(ios_deep_link)
    else:
        return redirect("https://www.ghanadude.com")


@api_view(["GET"])
def get_app_version(request):
    ios = AppVersion.objects.filter(platform="ios").first()
    android = AppVersion.objects.filter(platform="android").first()

    return Response(
        {
            "latest_version": ios.latest_version if ios else "1.0.0",
            "force_update": ios.force_update if ios else True,
            "app_store_url": ios.store_url if ios else "",
            "play_store_url": android.store_url if android else "",
        }
    )


def version_changelog(request):
    versions = AppVersion.objects.all().order_by("-updated_at")
    return render(request, "changelog.html", {"versions": versions})


class SiteSettingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        setting, _ = SiteSetting.objects.get_or_create(id=1)
        serializer = SiteSettingSerializer(setting)
        return Response(serializer.data)

    def post(self, request):
        setting, _ = SiteSetting.objects.get_or_create(id=1)
        serializer = SiteSettingSerializer(setting, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    
# views.py
@api_view(["PATCH"])
@permission_classes([AllowAny])
def update_user_app_version(request, user_id):
    profile = get_object_or_404(UserProfile, user_id=user_id)
    app_version = request.data.get("app_version")

    if app_version:
        profile.app_version = app_version
        profile.save()
        return Response({"detail": "App version updated"}, status=200)
    return Response({"error": "Invalid version"}, status=400)
