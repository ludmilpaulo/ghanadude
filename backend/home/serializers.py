# serializers.py
from rest_framework import serializers
from .models import DevPayment, SiteSetting

class DevPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevPayment
        fields = ['id', 'amount', 'invoice', 'note', 'created_at']


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = "__all__"