from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponseRedirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppVersion


def app_redirect_view(request: HttpRequest):
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()

    play_store_url = "https://play.google.com/store/apps/details?id=com.ludmil.ghanadudemobile"
    app_store_url = "https://apps.apple.com/us/app/ghanadude-clothing-co/id6743671049"
    android_package = "com.ludmil.ghanadudemobile"
    ios_deep_link = "ghanadude://"

    if 'android' in user_agent:
        # Redirect using intent with fallback to Play Store
        return HttpResponseRedirect(
            f"intent://#Intent;package={android_package};scheme=ghanadude;S.browser_fallback_url={play_store_url};end"
        )
    elif 'iphone' in user_agent or 'ipad' in user_agent:
        # Try iOS deep link; fallback can be handled in app or via universal link setup
        return HttpResponseRedirect(ios_deep_link)
    else:
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
