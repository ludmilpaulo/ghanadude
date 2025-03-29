from datetime import datetime, timedelta
import uuid
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.utils import timezone  # ✅ this is the correct timezone module

from revenue.models import Coupon
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
            <p><strong>Ghana Dude </strong></p>
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
            
            
            
@receiver(post_save, sender=Order)
def update_user_rewards_on_complete(sender, instance, **kwargs):
    if instance.status == 'Completed':
        profile = instance.user.profile
        points = instance.earned_points
        if points:
            profile.points += int(points)
            profile.save()
            
@receiver(post_save, sender=Order)
def assign_coupon_and_notify(sender, instance, **kwargs):
    if instance.status == 'Completed':
        # Create reward coupon
        coupon = Coupon.objects.create(
            user=instance.user,
            code=str(uuid.uuid4())[:8].upper(),
            value=30.00,  # reward value
            expires_at=timezone.now() + timedelta(days=14)
        )

        # Email notification
        send_mail(
            subject="🎉 You've received a reward coupon!",
            message=f"Thank you for your order! Use coupon code {coupon.code} to get R30 off your next order.",
            from_email="noreply@ghanadude.com",
            recipient_list=[instance.user.email],
            fail_silently=True,
        )
