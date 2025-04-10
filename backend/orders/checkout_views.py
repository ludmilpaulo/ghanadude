from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from decimal import Decimal
from .models import Order, OrderItem, BulkOrder
from product.models import Product
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    print("✅ Received checkout request")
    data = request.data.copy()
    files = request.FILES
    print(data)

    # 🔍 Validate required fields
    required_fields = ['address', 'city', 'postal_code', 'country']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=400)

    # 🔐 Validate user
    try:
        user = User.objects.get(pk=data.get('user_id'))
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    total_price = Decimal(data.get('total_price', '0'))
    reward_applied = Decimal(data.get('reward_applied', '0'))

    # 💰 Apply reward
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
    print(f"✅ Created Order {order.id}")

    # 🛍️ Process products
    try:
        items = json.loads(data.get('items', '[]'))
    except Exception as e:
        return Response({'error': 'Invalid items format'}, status=400)

    for item in items:
        try:
            product = Product.objects.get(pk=item['id'])
            product.reduce_stock(item['quantity'])

            if item.get('is_bulk'):
                BulkOrder.objects.create(
                    user=user,
                    product=product,
                    quantity=item['quantity'],
                    brand_logo=None,
                    custom_design=None,
                    status='Pending'
                )
            else:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=product.price
                )
        except Product.DoesNotExist:
            return Response({'error': f"Product ID {item['id']} not found"}, status=404)
        except ValueError as e:
            return Response({
                'error': str(e),
                'product_id': item['id'],
                'product_name': product.name,
            }, status=400)

    # 🎨 Process brand logo + custom design if uploaded
    brand_logo = files.get('brand_logo')
    custom_design = files.get('custom_design')

    brand_logo_qty = int(data.get('brand_logo_qty', 0))
    custom_design_qty = int(data.get('custom_design_qty', 0))

    if brand_logo and brand_logo_qty > 0:
        BulkOrder.objects.create(
            user=user,
            product=Product.objects.filter(bulk_sale=True).first(),  # you can customize this fallback logic
            quantity=brand_logo_qty,
            brand_logo=brand_logo,
            custom_design=None,
            status='Pending'
        )
        print(f"✅ Created BulkOrder with brand logo and quantity {brand_logo_qty}")

    if custom_design and custom_design_qty > 0:
        BulkOrder.objects.create(
            user=user,
            product=Product.objects.filter(bulk_sale=True).first(),  # customize this as needed
            quantity=custom_design_qty,
            brand_logo=None,
            custom_design=custom_design,
            status='Pending'
        )
        print(f"✅ Created BulkOrder with custom design and quantity {custom_design_qty}")

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
