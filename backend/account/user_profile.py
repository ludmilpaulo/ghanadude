from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserWithProfileSerializer,
)
import logging

logger = logging.getLogger(__name__)


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_user_profile(request, user_id):
    print("📥 Received PUT /account/update/ request for user_id:", user_id)

    try:
        user = User.objects.get(id=user_id)
        print("✅ Found user:", user.username)
    except User.DoesNotExist:
        print("❌ User not found.")
        return Response({"error": "User not found"}, status=404)

    profile, created = UserProfile.objects.get_or_create(user=user)
    if created:
        print("🆕 Created new UserProfile for user:", user.username)
    else:
        print("📎 Found existing profile for user:", user.username)

    # Log all incoming data
    print("📦 Incoming request.data:")
    for key, value in request.data.items():
        print(f"  {key}: {value}")

    # Prepare data
    user_data = {
        "first_name": request.data.get("first_name"),
        "last_name": request.data.get("last_name"),
        "email": user.email,
    }
    profile_data = {
        "phone_number": request.data.get("phone_number"),
        "address": request.data.get("address"),
        "city": request.data.get("city"),
        "postal_code": request.data.get("postal_code"),
        "country": request.data.get("country"),
    }

    print("🧾 Parsed user_data:", user_data)
    print("🧾 Parsed profile_data:", profile_data)

    user_serializer = UserSerializer(user, data=user_data, partial=True)
    profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)

    user_valid = user_serializer.is_valid()
    profile_valid = profile_serializer.is_valid()

    print("🧪 user_serializer valid?", user_valid)
    if not user_valid:
        print("❌ user_serializer errors:", user_serializer.errors)

    print("🧪 profile_serializer valid?", profile_valid)
    if not profile_valid:
        print("❌ profile_serializer errors:", profile_serializer.errors)

    if user_valid and profile_valid:
        user_serializer.save()
        profile_serializer.save()
        print("✅ Successfully saved user and profile.")
        full_serializer = UserWithProfileSerializer(user)
        return Response(full_serializer.data)

    print("❌ Returning combined errors.")
    return Response(
        {
            "user_errors": user_serializer.errors if not user_valid else {},
            "profile_errors": profile_serializer.errors if not profile_valid else {},
        },
        status=400,
    )
