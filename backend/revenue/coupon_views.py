from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.crypto import get_random_string
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User

from .models import Coupon
from .serializers import CouponSerializer
from orders.models import Order


@api_view(['POST'])
@permission_classes([AllowAny])
def redeem_rewards(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    completed_orders = Order.objects.filter(user=user, status='Completed')
    total_points = sum([getattr(order, 'earned_points', 0) for order in completed_orders])

    if total_points < 5:
        return Response({'detail': 'Not enough points to redeem.'}, status=status.HTTP_400_BAD_REQUEST)

    existing = Coupon.objects.filter(user=user, is_redeemed=False).first()
    if existing:
        return Response({'coupon_code': existing.code, 'detail': 'You already have a coupon to use.'})

    random_part = get_random_string(6).upper()
    coupon_code = f"REWARD-{random_part}"

    coupon = Coupon.objects.create(
        user=user,
        code=coupon_code,
        value=50.00,
        expires_at=timezone.now() + timedelta(days=30)
    )

    return Response({'coupon_code': coupon.code, 'value': str(coupon.value)})

@api_view(['POST'])
@permission_classes([AllowAny])
def get_user_rewards(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    completed_orders = Order.objects.filter(user=user, status='Completed')
    total_points = sum([getattr(order, 'earned_points', 0) for order in completed_orders])
    redeemable = total_points >= 5

    return Response({
        'total_points': total_points,
        'redeemable': redeemable
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def get_user_coupons(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    coupons = Coupon.objects.filter(user=user)
    serializer = CouponSerializer(coupons, many=True)
    return Response(serializer.data)
