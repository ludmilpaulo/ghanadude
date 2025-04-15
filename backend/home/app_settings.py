from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .models import SiteSetting, AppVersion
from .serializers import SiteSettingSerializer, AppVersionSerializer


@api_view(["GET", "PUT"])
def site_settings_view(request):
    try:
        site_setting = SiteSetting.objects.first()
        if request.method == "GET":
            serializer = SiteSettingSerializer(site_setting)
            return Response(serializer.data)

        elif request.method == "PUT":
            serializer = SiteSettingSerializer(site_setting, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except SiteSetting.DoesNotExist:
        return Response({"detail": "Site settings not found."}, status=404)


@api_view(["GET"])
def app_version_list(request):
    versions = AppVersion.objects.all()
    serializer = AppVersionSerializer(versions, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@parser_classes([MultiPartParser, FormParser])  # ✅ Enables image/file upload
def app_version_update(request, platform):
    try:
        app_version = AppVersion.objects.get(platform=platform.lower())
    except AppVersion.DoesNotExist:
        return Response({"detail": "AppVersion not found."}, status=404)

    serializer = AppVersionSerializer(app_version, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
