from django.core.mail import send_mail
from django.contrib.auth.models import User

from rest_framework import serializers


from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', "password", "is_staff"]

        extra_kwargs = {'password': {'write_only': True}}

