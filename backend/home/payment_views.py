# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PaymentGateway

@api_view(["GET"])
def get_active_payment_gateway(request):
    gateway = PaymentGateway.objects.filter(is_active=True).first()
    if gateway:
        data = {
            "url": gateway.url,
            "return_url": gateway.return_url,
            "notify_url": gateway.notify_url,
            "cancel_url": gateway.cancel_url,
            "merchantId": gateway.merchantId,
            "merchantKey": gateway.merchantKey,
            "sandbox": "sandbox" in (gateway.url or ""),  # detect if URL includes 'sandbox'
        }
        return Response(data)
    return Response({"error": "No active gateway found"}, status=404)
