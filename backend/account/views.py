from django.template.loader import render_to_string
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.authtoken.models import Token
from django.conf import settings
from rest_framework import generics, permissions

User = get_user_model()

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f'{settings.FRONTEND_URL}/ResetPassword?uid={uid}&token={token}'
            
            subject = 'Password Reset Request'
            message = render_to_string('emails/password_reset_email.html', {
                'username': user.username,
                'reset_url': reset_url
            })

            send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [user.email], html_message=message)
            return Response({'detail': 'Password reset email sent.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
