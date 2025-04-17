from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from decimal import Decimal
from django.core.mail import EmailMessage
from django.conf import settings

from home.models import SiteMeta
from utils.supabase import SUPABASE_PUBLIC_BASE
from .models import BulkOrderItem, Order, OrderItem, BulkOrder
from product.models import Product
from io import BytesIO
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from reportlab.pdfgen import canvas
import json


def generate_invoice_pdf(instance, is_bulk=False):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont("Helvetica-Bold", 16)
    title = (
        f"Bulk Invoice #{instance.id}" if is_bulk else f"Order Invoice #{instance.id}"
    )
    p.drawString(100, 800, title)
    p.setFont("Helvetica", 12)

    p.drawString(100, 780, f"User: {instance.user.username}")
    p.drawString(100, 760, f"Total Price: ${instance.total_price}")
    p.drawString(100, 740, f"Delivery Fee: ${instance.delivery_fee}")
    p.drawString(100, 720, f"VAT: ${instance.vat_amount}")
    p.drawString(100, 700, f"Order Type: {instance.order_type}")

    y = 680
    items = instance.bulkorderitem_set.all() if is_bulk else instance.items.all()
    for item in items:
        product_name = item.product.name if item.product else "Custom Upload"
        p.drawString(
            100, y, f"{product_name} - Qty: {item.quantity} - Price: ${item.price}"
        )
        y -= 20

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer


def send_invoice_email(instance, is_bulk=False):
    pdf = generate_invoice_pdf(instance, is_bulk=is_bulk)
    subject = f"Invoice for {'Bulk Order' if is_bulk else 'Order'} #{instance.id}"

    order_type = instance.order_type
    if order_type == "collection":
        address_summary = "Collection from store"
    else:
        address_summary = f"{instance.address}, {instance.city}, {instance.postal_code}, {instance.country}"

    # Get logo from SiteMeta if available
    site_meta = SiteMeta.objects.first()
    logo_url = ""
    if site_meta and site_meta.logo:
        logo_url = f"{SUPABASE_PUBLIC_BASE}/{site_meta.logo.name}"

    # Render HTML email
    html_message = render_to_string(
        "emails/invoice_email.html",
        {
            "order": instance,
            "address_summary": address_summary,
            "is_bulk": is_bulk,
            "logo_url": logo_url,
        },
    )

    # Prepare email
    email = EmailMessage(
        subject,
        html_message,
        settings.DEFAULT_FROM_EMAIL,
        [instance.user.email],
    )

    # ✅ Important fix: set content subtype to HTML
    email.content_subtype = "html"

    # Attach PDF invoice
    email.attach(f"invoice_{instance.id}.pdf", pdf.read(), "application/pdf")

    # Send email
    email.send()
    print(f"✅ Invoice sent to {instance.user.email}")
