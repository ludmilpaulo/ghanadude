import hashlib
import json
from urllib.parse import quote_plus, urlencode
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from product.models import Product
from orders.models import Order, OrderItem, TempOrder

def generate_signature(data, passphrase=''):
    sorted_keys = sorted(data.keys())
    payload = '&'.join(
        f'{key}={quote_plus(str(data[key]).strip())}'
        for key in sorted_keys if data[key]
    )

    if passphrase:
        payload += f"&passphrase={quote_plus(passphrase.strip())}"

    print("Payload used for signature:", payload)
    return hashlib.md5(payload.encode()).hexdigest()


# Initiate Payment View
@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_payment(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Token missing.'}, status=401)

    token_key = auth_header.split(' ')[1]
    try:
        token = Token.objects.get(key=token_key)
        user = token.user
    except Token.DoesNotExist:
        return Response({'error': 'Invalid token.'}, status=401)

    data = request.data
    total_price = f"{float(data['total_price']):.2f}"  # format properly as '100.00'

    temp_order = TempOrder.objects.create(
        user=user,
        total_price=total_price,
        cart_items=data['items'],
        shipping_info=data['shippingInfo']
    )

    payment_data = {
        'merchant_id': settings.PAYFAST_MERCHANT_ID,
        'merchant_key': settings.PAYFAST_MERCHANT_KEY,
        'return_url': settings.PAYFAST_RETURN_URL,
        'cancel_url': settings.PAYFAST_CANCEL_URL,
        'notify_url': settings.PAYFAST_NOTIFY_URL,
        'name_first': data['shippingInfo']['fullName'],
        'email_address': user.email,
        'amount': total_price,
        'item_name': f"Order Payment #{temp_order.id}",
        'custom_str1': str(temp_order.id),
        'pay_on_site': '1'
    }

    payment_data['signature'] = generate_signature(payment_data, settings.PAYFAST_PASSPHRASE)

    payment_url = f"https://sandbox.payfast.co.za/eng/process?{urlencode(payment_data)}"

    return Response({'paymentUrl': payment_url})

# PayFast Notify (Payment Confirmation View)
@api_view(['POST'])
@permission_classes([AllowAny])
def payfast_notify(request):
    data = request.POST
    temp_order_id = data.get('custom_str1')

    try:
        temp_order = TempOrder.objects.get(pk=temp_order_id)
        user = temp_order.user

        order = Order.objects.create(
            user=user,
            total_price=data.get('amount_gross'),
            address=temp_order.shipping_info['address'],
            city=temp_order.shipping_info['city'],
            postal_code=temp_order.shipping_info['postalCode'],
            country=temp_order.shipping_info.get('country', 'South Africa'),
            payment_method='PayFast',
            status='Completed'
        )

        for item in temp_order.cart_items:
            product = Product.objects.get(pk=item['id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price
            )

        temp_order.delete()
        return HttpResponse(status=200)

    except TempOrder.DoesNotExist:
        return HttpResponse(status=400)

    except Exception as e:
        print("PayFast notify error:", e)
        return HttpResponse(status=500)
