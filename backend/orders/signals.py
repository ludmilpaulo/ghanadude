from datetime import datetime
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.files.base import ContentFile

from orders.pdf import generate_order_pdf
from .models import Order
from .utils import send_order_email

@receiver(pre_save, sender=Order)
def track_order_status_change(sender, instance, **kwargs):
    if instance.pk:
        previous = Order.objects.get(pk=instance.pk)
        instance._previous_status = previous.status

@receiver(post_save, sender=Order)
def order_status_changed(sender, instance, **kwargs):
    if hasattr(instance, '_previous_status') and instance._previous_status != instance.status:
        message = f"""
        <html>
        <body>
            <p>Dear {instance.user.username},</p>
            <p>We would like to inform you that the status of your order (Order ID: <strong>{instance.id}</strong>) has been updated to <strong>{instance.status}</strong>.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
                <li>Total Price: <strong>R{instance.total_price}</strong></li>
                <li>Current Status: <strong>{instance.status}</strong></li>
            </ul>
            <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
            <p>Thank you for shopping with us.</p>
            <p>Best regards,</p>
            <p><strong>Men's Clinic</strong></p>
            <p>{datetime.now().year}</p>
        </body>
        </html>
        """

        send_order_email(
            subject='Order Status Update',
            message=message,
            recipient_list=[instance.user.email]
        )

@receiver(post_save, sender=Order)
def update_order_invoice(sender, instance, **kwargs):
    if hasattr(instance, '_previous_status') and instance._previous_status != instance.status:
        pdf_content = generate_order_pdf(instance)  # Call without request
        if pdf_content:
            pdf_path = f'invoices/order_{instance.id}.pdf'
            instance.invoice.save(pdf_path, ContentFile(pdf_content), save=False)
            instance.save(update_fields=['invoice'])
