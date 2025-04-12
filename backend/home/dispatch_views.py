from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.timezone import now
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import random

from orders.models import BulkOrder, Order


def generate_pin():
    return f"{random.randint(100000, 999999)}"


@api_view(["POST"])
def dispatch_order(request):
    print("🚀 Dispatch request received")
    order_type = request.data.get("type")  # 'regular' or 'bulk'
    order_id = request.data.get("order_id")

    print("🚀 Dispatch request received")
    print("Order Type:", order_type)
    print("Order ID:", order_id)

    if order_type not in ["regular", "bulk"] or not order_id:
        print("❌ Invalid request data")
        return Response(
            {"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if order_type == "regular":
            order = Order.objects.get(id=order_id, is_dispatched=False)
            print("✅ Regular order found")
            user = order.user
            address = (
                f"{order.address}, {order.city}, {order.country}, {order.postal_code}"
            )
        else:
            order = BulkOrder.objects.get(id=order_id, is_dispatched=False)
            print("✅ Bulk order found")
            user = order.user
            address = "Provided upon order placement"

        pin_code = generate_pin()
        order.pin_code = pin_code
        order.is_dispatched = True
        order.save()
        print(f"📦 Order marked as dispatched with PIN: {pin_code}")

        html_content = render_to_string(
            "emails/dispatch_notification.html",
            {"user": user, "address": address, "pin_code": pin_code},
        )

        email = EmailMultiAlternatives(
            subject="🚚 Your Order Has Been Dispatched",
            body=strip_tags(html_content),
            from_email="no-reply@ghanadude.com",
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        print(f"📧 Email sent to {user.email}")

        return Response(
            {"message": "Order dispatched and email sent."}, status=status.HTTP_200_OK
        )

    except (Order.DoesNotExist, BulkOrder.DoesNotExist):
        print("❌ Order not found or already dispatched")
        return Response(
            {"error": "Order not found or already dispatched"},
            status=status.HTTP_404_NOT_FOUND,
        )
