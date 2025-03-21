from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from orders.models import Order, OrderItem
from django.contrib.auth.models import User
from product.models import Product

@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    user = User.objects.get(pk=data['user_id'])
    order = Order.objects.create(
        user=user,
        total_price=data['total_price'],
        address=data['address'],
        city=data['city'],
        postal_code=data['postal_code'],
        country=data['country'],
        payment_method=data['payment_method'],
        status=data['status']
    )

    for item in data['items']:
        product = Product.objects.get(pk=item['id'])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item['quantity'],
            price=product.price
        )

    return Response({'order_id': order.id}, status=201)




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
