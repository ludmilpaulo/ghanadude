from django.template.loader import render_to_string
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

from .models import UserProfile
from .serializers import UserProfileSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.authtoken.models import Token
from django.conf import settings
from rest_framework.decorators import api_view
from .serializers import UserWithProfileSerializer
from rest_framework import generics, permissions
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        print("📢 Fetching all users with profiles...")
        users = User.objects.select_related("profile").all()
        serializer = UserWithProfileSerializer(users, many=True)
        print(f"✅ Found {len(users)} users.")
        return Response(serializer.data)


@permission_classes([AllowAny])
class UserSignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        logger.debug(f"Received data: username={username}, email={email}")

        if not username or not email or not password:
            logger.error("Missing fields")
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            logger.error("Username already exists")
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            logger.error("Email already exists")
            return Response(
                {"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            status=status.HTTP_201_CREATED,
        )


@permission_classes([AllowAny])
class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                print("user don't exist")
                return Response(
                    {"error": "User name don't exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user = authenticate(username=user.username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": token.key,
                    "user_id": user.id,
                    "username": user.username,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST
            )


from rest_framework.permissions import AllowAny


@permission_classes([AllowAny])
class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            return Response(
                {
                    "username": user.username,
                    "uid": uid,
                    "token": token,
                },
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )


@permission_classes([AllowAny])
class PasswordResetConfirmView(APIView):
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("newPassword")

        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)

            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()

                # Send email with new credentials
                subject = "Your Password Has Been Reset"
                message = render_to_string(
                    "emails/password_reset_success_email.html",
                    {
                        "username": user.username,
                        "email": user.email,
                        "new_password": new_password,
                    },
                )

                send_mail(
                    subject,
                    "",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_message=message,
                )

                return Response(
                    {"detail": "Password has been reset."}, status=status.HTTP_200_OK
                )

            return Response(
                {"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
            )

        except (User.DoesNotExist, ValueError):
            return Response(
                {"error": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_profile(request, user_id):
    logger.debug(f"Received user_id: {user_id}")
    try:
        user = User.objects.get(id=user_id)
        serializer = UserWithProfileSerializer(user)
        print(serializer.data)

        return Response(serializer.data)

    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        return Response({"error": "User not found"}, status=404)
