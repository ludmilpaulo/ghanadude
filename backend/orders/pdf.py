from django.template.loader import render_to_string
from django.http import HttpResponse
from django.conf import settings

from weasyprint import HTML
import os
from .models import Order


from io import BytesIO

from xhtml2pdf import pisa


import logging

logger = logging.getLogger(__name__)

def generate_order_pdf(order, request=None):
    try:

        html_string = render_to_string('invoice_template.html', {'order': order})

        buffer = BytesIO()

        if request:
            pisa_status = pisa.CreatePDF(html_string, dest=buffer, link_callback=lambda uri, rel: request.build_absolute_uri(uri))
        else:
            pisa_status = pisa.CreatePDF(html_string, dest=buffer)

        if pisa_status.err:
            logger.error("PDF generation failed: %s", pisa_status.err)
            return None

        buffer.seek(0)
        logger.info("PDF generated successfully for order: %s", order.id)
        return buffer.read()
    except Exception as e:
        logger.error("Exception during PDF generation: %s", str(e))
        return None
