from django.core.mail import EmailMessage
from django.conf import settings
from home.models import SiteMeta
from utils.supabase import SUPABASE_PUBLIC_BASE
from django.template.loader import render_to_string
from .invoice_pdf import generate_invoice_pdf_weasy  # ✅ Updated to use WeasyPrint version


def send_invoice_email(instance, is_bulk=False):
    # ✅ Generate PDF with professional WeasyPrint layout
    pdf = generate_invoice_pdf_weasy(instance, is_bulk=is_bulk)
    subject = f"Invoice for {'Bulk Order' if is_bulk else 'Order'} #{instance.id}"

    order_type = instance.order_type
    if order_type == "collection":
        address_summary = "Collection from store"
    else:
        address_summary = f"{instance.address}, {instance.city}, {instance.postal_code}, {instance.country}"

    # ✅ Get logo from SiteMeta
    site_meta = SiteMeta.objects.first()
    logo_url = f"{SUPABASE_PUBLIC_BASE}/{site_meta.logo.name}" if site_meta and site_meta.logo else ""

    # ✅ Render email HTML
    html_message = render_to_string(
        "emails/invoice_email.html",
        {
            "order": instance,
            "address_summary": address_summary,
            "is_bulk": is_bulk,
            "logo_url": logo_url,
        },
    )

    # ✅ Create and send email
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[instance.user.email],
    )
    email.content_subtype = "html"
    email.attach(f"invoice_{instance.id}.pdf", pdf.read(), "application/pdf")
    email.send()

    print(f"✅ Invoice sent to {instance.user.email}")
