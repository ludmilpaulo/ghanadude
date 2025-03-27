from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Order, OrderItem, BulkOrder
from product.models import Product
from revenue.models import Coupon

@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    print(f"✅ Step 1: Received request data: {data}")

    required_fields = ['address', 'city', 'postal_code', 'country']
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        print(f"❌ Missing fields: {missing_fields}")
        return Response(
            {'error': f'Missing fields: {", ".join(missing_fields)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(pk=data['user_id'])
        print("✅ Step 2: User found")
    except User.DoesNotExist:
        print("❌ User not found")
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    coupon = None
    if data.get('coupon_code'):
        try:
            coupon = Coupon.objects.get(code=data['coupon_code'], user=user, is_redeemed=False)
            coupon.is_redeemed = True
            coupon.save()
            print("✅ Step 3: Coupon applied")
        except Coupon.DoesNotExist:
            print("⚠️ Coupon not found or already redeemed")

    order = Order.objects.create(
        user=user,
        total_price=data['total_price'],
        address=data['address'],
        city=data['city'],
        postal_code=data['postal_code'],
        country=data['country'],
        payment_method=data.get('payment_method', 'payfast'),
        status=data.get('status', 'pending'),
        coupon=coupon,
        discount_amount=coupon.value if coupon else 0,
    )
    print(f"✅ Step 4: Order created with ID {order.id}")

    items = data.get('items', [])
    for item in items:
        try:
            product = Product.objects.get(pk=item['id'])
            product.reduce_stock(item['quantity'])
            print(f"✅ Step 5: Stock reduced for product ID {product.id}")

            if item.get('is_bulk'):
                bulk_order = BulkOrder.objects.create(
                    user=user,
                    product=product,
                    quantity=item['quantity'],
                    brand_logo=request.FILES.get('brand_logo'),
                    custom_design=request.FILES.get('custom_design'),
                    status='Pending',
                )
                print(f"✅ Step 6 (Bulk): Bulk order created (ID {bulk_order.id})")
            else:
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=product.price,
                )
                print(f"✅ Step 6 (Regular): Order item created (ID {order_item.id})")
        except Product.DoesNotExist:
            print(f"❌ Product with ID {item['id']} not found")
            return Response({'error': f"Product with ID {item['id']} not found."}, status=404)
        except ValueError as e:
            print(f"❌ Error reducing stock: {e}")
            return Response({'error': str(e)}, status=400)

    print("✅ Step 7: Checkout completed successfully")
    return Response({'order_id': order.id}, status=status.HTTP_201_CREATED)


# PayFast notification endpoint
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
        return HttpResponse(status=200)
    except Order.DoesNotExist:
        return HttpResponse(status=400)
