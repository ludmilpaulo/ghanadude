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

    # 🧾 Check if order_type is 'delivery' or 'collection'
    order_type = data.get('order_type', 'delivery')
    print(f"📦 Order type: {order_type}")

    required_fields = [] if order_type == 'collection' else ['address', 'city', 'postal_code', 'country']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        print(f"❌ Missing fields: {missing}")
        return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=400)

    try:
        user = User.objects.get(pk=data.get('user_id'))
        print(f"👤 User found: {user.username}")
    except User.DoesNotExist:
        print("❌ User not found")
        return Response({'error': 'User not found'}, status=404)

    total_price = Decimal(data.get('total_price', '0'))
    reward_applied = Decimal(data.get('reward_applied', '0'))

    # 🏆 Deduct reward if used
    if reward_applied > 0:
        profile = user.profile
        print(f"💸 Deducting reward: {reward_applied}")
        profile.reward_balance = max(Decimal('0.00'), profile.reward_balance - reward_applied)
        profile.save()

    # 🧾 Create Order
    order = Order.objects.create(
        user=user,
        total_price=total_price,
        reward_applied=reward_applied,
        address=data.get('address', ''),
        city=data.get('city', ''),
        postal_code=data.get('postal_code', ''),
        country=data.get('country', ''),
        payment_method=data.get('payment_method', 'payfast'),
        status=data.get('status', 'pending'),
        delivery_fee=Decimal(data.get('delivery_fee', '0.00')),
        vat_amount=Decimal(data.get('vat_amount', '0.00')),
        order_type=order_type,  # ✅ Save order_type
    )
    print(f"✅ Order created: #{order.id}")

    # 🛒 Process items
    try:
        items = json.loads(data.get('items', '[]'))
        print(f"🧾 Items received: {len(items)}")
    except json.JSONDecodeError:
        print("❌ Invalid items JSON")
        return Response({'error': 'Invalid items JSON format'}, status=400)

    for item in items:
        try:
            product = Product.objects.get(pk=item['id'])
            product.reduce_stock(item['quantity'])

            if item.get('is_bulk'):
                print(f"📦 Creating BulkOrder for {product.name} x{item['quantity']}")
                BulkOrder.objects.create(
                    user=user,
                    product=product,
                    quantity=item['quantity'],
                    status='Pending',
                    delivery_fee=Decimal(data.get('delivery_fee', '0.00')),
                    vat_amount=Decimal(data.get('vat_amount', '0.00')),
                    order_type=order_type
                )
            else:
                print(f"🛍️ Creating OrderItem for {product.name} x{item['quantity']}")
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=product.price,
                )
        except Product.DoesNotExist:
            print(f"❌ Product not found: {item['id']}")
            return Response({'error': f"Product ID {item['id']} not found"}, status=404)
        except ValueError as e:
            print(f"❌ Error with product {item['id']}: {str(e)}")
            return Response({
                'error': str(e),
                'product_id': item['id'],
                'product_name': product.name,
            }, status=400)

    # 🖼️ Handle brand logo and custom design uploads
    brand_logo = files.get('brand_logo')
    custom_design = files.get('custom_design')
    brand_logo_qty = int(data.get('brand_logo_qty', 0))
    custom_design_qty = int(data.get('custom_design_qty', 0))

    if brand_logo and brand_logo_qty > 0:
        print(f"🎨 Brand logo uploaded x{brand_logo_qty}")
        BulkOrder.objects.create(
            user=user,
            product=None,
            quantity=brand_logo_qty,
            brand_logo=brand_logo,
            status='Pending',
            delivery_fee=Decimal(data.get('delivery_fee', '0.00')),
            order_type=order_type,
            vat_amount=Decimal(data.get('vat_amount', '0.00'))
        )

    if custom_design and custom_design_qty > 0:
        print(f"🧵 Custom design uploaded x{custom_design_qty}")
        BulkOrder.objects.create(
            user=user,
            product=None,
            quantity=custom_design_qty,
            custom_design=custom_design,
            status='Pending',
            delivery_fee=Decimal(data.get('delivery_fee', '0.00')),
            order_type=order_type,
            vat_amount=Decimal(data.get('vat_amount', '0.00'))
        )

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
