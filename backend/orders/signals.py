from datetime import datetime, timedelta
from django.urls import reverse
import os
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.utils import timezone  # ✅ this is the correct timezone module
from decimal import Decimal

from django.template.loader import render_to_string
from django.templatetags.static import static

from utils.supabase import SUPABASE_PUBLIC_BASE
from home.models import SiteMeta
from orders.pdf import generate_order_pdf
from .models import Order
from .utils import send_order_email


site_meta = SiteMeta.objects.first()

@receiver(pre_save, sender=Order)
def track_order_status_change(sender, instance, **kwargs):
    if instance.pk:
        previous = Order.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
        instance._status_changed_to_completed = (
            previous.status != "Completed" and instance.status == "Completed"
        )
    else:
        # It's a new order
        instance._status_changed_to_completed = instance.status == "Completed"


@receiver(post_save, sender=Order)
def order_status_changed(sender, instance, **kwargs):
    if (
        hasattr(instance, "_previous_status")
        and instance._previous_status != instance.status
    ):
        logo_url = ""
        if site_meta and site_meta.logo:
            logo_path = site_meta.logo.name
            logo_url = f"{SUPABASE_PUBLIC_BASE}/{logo_path}"
        order_url = (
            f"https://yourdomain.com{reverse('order-detail', args=[instance.id])}"
        )

        html_message = render_to_string(
            "emails/order_status_update.html",
            {
                "username": instance.user.username,
                "order_id": instance.id,
                "total_price": instance.total_price,
                "status": instance.status,
                "year": datetime.now().year,
                "logo_url": logo_url,
                "order_url": order_url,
                "facebook_url": getattr(site_meta, "facebook_url", ""),
                "twitter_url": getattr(site_meta, "twitter_url", ""),
                "instagram_url": getattr(site_meta, "instagram_url", ""),
                "youtube_url": getattr(site_meta, "youtube_url", ""),
                "linkedin_url": getattr(site_meta, "linkedin_url", ""),
                "whatsapp_url": getattr(site_meta, "whatsapp_url", ""),
                "tiktok_url": getattr(site_meta, "tiktok_url", ""),
                "pinterest_url": getattr(site_meta, "pinterest_url", ""),
                "snapchat_url": getattr(site_meta, "snapchat_url", ""),
                "telegram_url": getattr(site_meta, "telegram_url", ""),
            },
        )

        send_order_email(
            subject="Order Status Update",
            message="",
            recipient_list=[instance.user.email],
            html_message=html_message,
        )


@receiver(post_save, sender=Order)
def update_order_invoice(sender, instance, **kwargs):
    if (
        hasattr(instance, "_previous_status")
        and instance._previous_status != instance.status
    ):
        pdf_content = generate_order_pdf(instance)  # Call without request
        if pdf_content:
            pdf_path = f"invoices/order_{instance.id}.pdf"
            instance.invoice.save(pdf_path, ContentFile(pdf_content), save=False)
            instance.save(update_fields=["invoice"])


@receiver(post_save, sender=Order)
def accumulate_cashback(sender, instance, **kwargs):
    if instance.status == "Completed" and not instance.reward_granted:
        profile = instance.user.profile
        reward_amount = Decimal((instance.total_price // 100) * 5)

        if reward_amount > 0:
            profile.reward_balance += reward_amount
            profile.save()

            instance.reward_granted = True
            instance.save(update_fields=["reward_granted"])

            logo_url = static("logo.png")
            html_message = render_to_string(
                "emails/cashback_reward.html",
                {
                    "username": instance.user.username,
                    "total_price": f"{instance.total_price:.2f}",
                    "reward_amount": f"{reward_amount:.2f}",
                    "reward_balance": f"{profile.reward_balance:.2f}",
                    "year": datetime.now().year,
                    "logo_url": logo_url,
                },
            )

            send_mail(
                subject=f"🎉 You've earned R{reward_amount:.2f} in cashback!",
                message="",  # Fallback plain text if needed
                from_email=f"support@{settings.EMAIL_HOST}",
                recipient_list=[instance.user.email],
                html_message=html_message,
                fail_silently=True,
            )
