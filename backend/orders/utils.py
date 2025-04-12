from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

import logging

logger = logging.getLogger(__name__)


def send_order_email(
    subject, message, recipient_list, html_message=None, attachments=None
):
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=strip_tags(html_message if html_message else message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
        )
        if html_message:
            email.attach_alternative(html_message, "text/html")
        else:
            email.attach_alternative(message, "text/html")

        if attachments:
            for attachment in attachments:
                email.attach(
                    attachment["filename"],
                    attachment["content"],
                    attachment["mime_type"],
                )

        email.send()
        logger.info("Email sent successfully to %s", recipient_list)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", recipient_list, str(e))
        raise e
