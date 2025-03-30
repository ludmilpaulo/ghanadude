# views.py
from django.shortcuts import render
from .models import AppVersion
from rest_framework.decorators import api_view
from rest_framework.response import Response


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
