from datetime import datetime

from django.http import HttpResponse

from product.serializers import CategorySerializer, ProductSerializer, ImageSerializer
from product.models import Product, Image, Category
from datetime import datetime
from rest_framework.decorators import action


from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from .models import Order, OrderItem
from .serializers import OrderItemSerializer, OrderSerializer


from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [AllowAny]


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [AllowAny]


from datetime import datetime
from django.db.models import Sum
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Existing imports...
from .models import Order  # Ensure the correct import path for your Order model


@api_view(["GET"])
@permission_classes([AllowAny])
def sales_summary(request):
    try:
        today = datetime.today()
        start_of_day = today.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_year = today.replace(
            month=1, day=1, hour=0, minute=0, second=0, microsecond=0
        )

        daily_sales = (
            Order.objects.filter(created_at__gte=start_of_day).aggregate(
                total_sales=Sum("total_price")
            )["total_sales"]
            or 0
        )
        monthly_sales = (
            Order.objects.filter(created_at__gte=start_of_month).aggregate(
                total_sales=Sum("total_price")
            )["total_sales"]
            or 0
        )
        yearly_sales = (
            Order.objects.filter(created_at__gte=start_of_year).aggregate(
                total_sales=Sum("total_price")
            )["total_sales"]
            or 0
        )

        return Response(
            {
                "daily_sales": daily_sales,
                "monthly_sales": monthly_sales,
                "yearly_sales": yearly_sales,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def user_statistics(request):
    try:
        most_purchases_user = (
            Order.objects.values("user__username")
            .annotate(total_spent=Sum("total_price"))
            .order_by("-total_spent")
            .first()
        )
        if not most_purchases_user:
            most_purchases_user = {"user__username": "None", "total_spent": 0}

        return Response(
            {
                "most_purchases_user": most_purchases_user["user__username"],
                "total_spent": most_purchases_user["total_spent"],
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def location_statistics(request):
    try:
        location_stats = (
            Order.objects.values("country")
            .annotate(total_sales=Sum("total_price"))
            .order_by("-total_sales")
        )

        return Response(location_stats, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ✅ PayFast Webhook
@api_view(["POST"])
@permission_classes([AllowAny])
def payfast_notify(request):
    data = request.POST
    m_payment_id = data.get("m_payment_id")
    payment_status = data.get("payment_status")

    try:
        order = Order.objects.get(pk=m_payment_id)
        if payment_status == "COMPLETE":
            order.status = "completed"
        elif payment_status == "CANCELLED":
            order.status = "canceled"
        else:
            order.status = "pending"

        order.save()
        print(f"🔔 PayFast updated Order {order.id} to {order.status}")
        return HttpResponse(status=200)

    except Order.DoesNotExist:
        print("❌ PayFast notify: Order not found")
        return HttpResponse(status=400)