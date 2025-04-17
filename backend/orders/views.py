from datetime import datetime

from django.http import HttpResponse

from product.serializers import CategorySerializer, ProductSerializer, ImageSerializer
from product.models import Product, Image, Category
from datetime import datetime
from rest_framework.decorators import action

from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from .models import BulkOrder, Order, OrderItem
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

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def payfast_notify(request):
    data = request.POST
    m_payment_id = data.get("m_payment_id")
    payment_status = data.get("payment_status")

    print("🔔 Received PayFast Notify:", m_payment_id, payment_status)

    try:
        if m_payment_id.startswith("ORDER_"):
            order_id = int(m_payment_id.replace("ORDER_", ""))
            order = Order.objects.get(pk=order_id)
        elif m_payment_id.startswith("BULKORDER_"):
            order_id = int(m_payment_id.replace("BULKORDER_", ""))
            order = BulkOrder.objects.get(pk=order_id)
        else:
            print("❌ Invalid m_payment_id format:", m_payment_id)
            return HttpResponse("Invalid m_payment_id", status=400)

        # ✅ Update status
        if payment_status == "COMPLETE":
            order.status = "completed"
        elif payment_status == "CANCELLED":
            order.status = "canceled"
        else:
            order.status = "pending"

        order.save()
        print(f"✅ PayFast updated {order.__class__.__name__} {order.id} to {order.status}")
        return HttpResponse("OK", status=200)

    except (Order.DoesNotExist, BulkOrder.DoesNotExist):
        print("❌ PayFast notify: Order not found")
        return HttpResponse("Order not found", status=404)

    except Exception as e:
        print("❌ Server error:", str(e))
        return HttpResponse("Internal server error", status=500)
