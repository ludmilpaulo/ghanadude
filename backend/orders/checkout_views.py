# views.py
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from decimal import Decimal

from .models import Order, OrderItem, BulkOrder
from product.models import Product

@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    print(f"✅ Received checkout request: {data}")

    # 🔍 Required fields validation
    required_fields = ['address', 'city', 'postal_code', 'country']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return Response({'error': f'Missing fields: {", ".join(missing_fields)}'}, status=400)

    # 🔐 Validate user
    try:
        user = User.objects.get(pk=data['user_id'])
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    total_price = Decimal(data['total_price'])
    reward_applied = Decimal(data.get('reward_applied', 0))

    # 💰 Deduct reward if applied
    if reward_applied > 0:
        profile = user.profile
        profile.reward_balance = max(Decimal('0.00'), profile.reward_balance - reward_applied)
        profile.save()
        print(f"✅ Deducted R{reward_applied} from reward balance.")

    # 🧾 Create Order
    order = Order.objects.create(
        user=user,
        total_price=total_price,
        reward_applied=reward_applied,
        address=data['address'],
        city=data['city'],
        postal_code=data['postal_code'],
        country=data['country'],
        payment_method=data.get('payment_method', 'payfast'),
        status=data.get('status', 'pending'),
    )
    print(f"✅ Order created: ID {order.id}")

    # 🛍 Process Items
    for item in data.get('items', []):
        try:
            product = Product.objects.get(pk=item['id'])
            product.reduce_stock(item['quantity'])  # May raise ValueError

            if item.get('is_bulk'):
                BulkOrder.objects.create(
                    user=user,
                    product=product,
                    quantity=item['quantity'],
                    brand_logo=request.FILES.get('brand_logo'),
                    custom_design=request.FILES.get('custom_design'),
                    status='Pending',
                )
            else:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=product.price,
                )

        except Product.DoesNotExist:
            return Response({
                'error': f"Product ID {item['id']} not found"
            }, status=404)

        except ValueError as e:
            # 🚫 Insufficient stock error
            return Response({
                'error': str(e),
                'product_id': item['id'],
                'product_name': product.name,
            }, status=400)

    print("✅ Checkout complete")
    return Response({'order_id': order.id}, status=201)


# ✅ PayFast Webhook
@api_view(['POST'])
@permission_classes([AllowAny])
def payfast_notify(request):
    data = request.POST
    m_payment_id = data.get('m_payment_id')
    payment_status = data.get('payment_status')

    try:
        order = Order.objects.get(pk=m_payment_id)
        if payment_status == 'COMPLETE':
            order.status = 'completed'
        elif payment_status == 'CANCELLED':
            order.status = 'canceled'
        else:
            order.status = 'pending'

        order.save()
        print(f"🔔 PayFast updated Order {order.id} to {order.status}")
        return HttpResponse(status=200)

    except Order.DoesNotExist:
        print("❌ PayFast notify: Order not found")
        return HttpResponse(status=400)
