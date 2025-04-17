from django.template.loader import render_to_string
from weasyprint import HTML
from io import BytesIO
from decimal import Decimal
from num2words import num2words
from datetime import timedelta
from home.models import SiteMeta
from utils.supabase import SUPABASE_PUBLIC_BASE


def generate_invoice_pdf_weasy(instance, is_bulk=False):
    site_meta = SiteMeta.objects.first()
    logo_url = f"{SUPABASE_PUBLIC_BASE}/{site_meta.logo.name}" if site_meta and site_meta.logo else ""

    items = instance.bulkorderitem_set.all() if is_bulk else instance.items.all()
    subtotal = sum(item.quantity * float(item.price) for item in items)
    total = float(instance.total_price)
    vat = float(instance.vat_amount)
    delivery = float(instance.delivery_fee)

    total_words = num2words(Decimal(total), to="currency", lang="en_ZA").replace("euro", "South African rand")

    html_string = render_to_string("pdf/invoice_template.html", {
        "order": instance,
        "items": items,
        "is_bulk": is_bulk,
        "logo_url": logo_url,
        "subtotal": subtotal,
        "vat": vat,
        "delivery": delivery,
        "total": total,
        "total_words": total_words.capitalize(),
        "due_date": instance.created_at + timedelta(days=5),
    })

    pdf_file = BytesIO()
    HTML(string=html_string).write_pdf(pdf_file)
    pdf_file.seek(0)
    return pdf_file
