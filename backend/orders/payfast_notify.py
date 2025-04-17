from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.core.mail import send_mail
from orders.models import Order, BulkOrder
from orders.order_email import send_invoice_email
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
def payfast_notify(request):
    data = request.POST
    m_payment_id = data.get("m_payment_id")
    payment_status = data.get("payment_status")

    logger.info("🔔 PayFast Notify Received:")
    logger.info(f"m_payment_id: {m_payment_id}")
    logger.info(f"payment_status: {payment_status}")

    try:
        if not m_payment_id:
            logger.error("❌ Missing m_payment_id")
            return HttpResponse("Missing m_payment_id", status=400)

        if m_payment_id.startswith("ORDER_"):
            order_id = int(m_payment_id.replace("ORDER_", ""))
            order = Order.objects.get(pk=order_id)
        elif m_payment_id.startswith("BULKORDER_"):
            order_id = int(m_payment_id.replace("BULKORDER_", ""))
            order = BulkOrder.objects.get(pk=order_id)
        else:
            logger.error("❌ Invalid m_payment_id format")
            return HttpResponse("Invalid m_payment_id", status=400)

        is_bulk = isinstance(order, BulkOrder)

        # ✅ Update status and send emails
        if payment_status == "COMPLETE":
            order.status = "processing"
            logger.info(f"✅ Payment complete for {order.__class__.__name__} {order.id}")

            # 📤 Send invoice email to customer
            send_invoice_email(order, is_bulk=is_bulk)

            # 📤 Notify admin
            admin_emails = User.objects.filter(is_superuser=True).exclude(email__isnull=True).values_list('email', flat=True)
            if admin_emails:
                subject = f"💸 Payment Received: {'BulkOrder' if is_bulk else 'Order'} #{order.id}"
                message = (
                    f"Payment for {'BulkOrder' if is_bulk else 'Order'} #{order.id} has been received and marked as completed.\n\n"
                    f"Customer: {order.user.get_full_name()} ({order.user.email})\n"
                    f"Total Paid: R{order.total_price}\n"
                    f"Order Type: {getattr(order, 'order_type', 'delivery')}\n"
                    f"Status: {order.status}\n"
                )
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, list(admin_emails))
                logger.info(f"📨 Admins notified: {', '.join(admin_emails)}")


        elif payment_status == "CANCELLED":
            order.status = "canceled"
        else:
            order.status = "pending"

        order.save()
        return HttpResponse("OK")

    except (Order.DoesNotExist, BulkOrder.DoesNotExist):
        logger.error("❌ Order not found for m_payment_id: %s", m_payment_id)
        return HttpResponse("Order not found", status=404)

    except Exception as e:
        logger.exception("❌ Unexpected error during PayFast notify:")
        return HttpResponse("Internal server error", status=500)
