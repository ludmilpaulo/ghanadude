from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.db import transaction
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.timezone import now
from .models import Order, OrderItem
from .serializers import OrderSerializer
from .utils import send_order_email
from .pdf import generate_order_pdf  # Correct import for generate_order_pdf
from django.contrib.auth.models import User
from product.models import Product
from backend.settings import MEDIA_ROOT
import os

import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    data = request.data
    logger.info("Request data: %s", data)

    token_key = data.get('token', None)
    logger.info("Token key: %s", token_key)
    user = None
    new_user = False

    if token_key:
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
            logger.info("User retrieved from token: %s", user)
        except Token.DoesNotExist:
            logger.warning("Token does not exist.")

    if not user:
        user_id = data.get('user_id', None)
        logger.info("User ID: %s", user_id)
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                logger.info("User retrieved from user_id: %s", user)
            except User.DoesNotExist:
                logger.warning("User does not exist for user_id: %s", user_id)

    if not user:
        email = data.get('email')
        try:
            user = User.objects.get(email=email)
            logger.info("Existing user retrieved: %s", user)
        except User.DoesNotExist:
            name = data.get('name', 'user')
            email = data.get('email', f'{name}@example.com')
            password = data.get('password', email)
            username = f'{name[0]}{User.objects.count() + 1}'
            logger.info("Creating new user with username: %s", username)
            user = User.objects.create_user(username=username, email=email, password=password)
            new_user = True
            logger.info("New user created: %s", user)

            token = Token.objects.create(user=user)
            token_key = token.key
            logger.info("Token created for new user: %s", token_key)

    try:
        with transaction.atomic():
            logger.info("Creating Order object...")
            order = Order.objects.create(
                user=user,
                total_price=data['total_price'],
                address=data['address'],
                city=data['city'],
                postal_code=data['postal_code'],
                country=data['country'],
                payment_method=data['payment_method']
            )
            logger.info("Order object created: %s", order)

            for item in data['items']:
                product = Product.objects.get(id=item['id'])
                if product.quantity_available < item['quantity']:
                    raise ValueError(f"Not enough stock for {product.name}")
                logger.info("Creating OrderItem object for drug: %s", product)

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=product.price
                )
                logger.info("OrderItem object created for drug: %s", product.name)
                product.quantity_available -= item['quantity']
                product.save()
                logger.info("Drug quantity updated for: %s", product.name)

            pdf_content = generate_order_pdf(order, request)  # Pass the request object here
            if pdf_content is None:
                logger.error("Error generating PDF for order: %s", order.id)
                return Response({'detail': 'Error generating PDF.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            pdf_path = os.path.join(MEDIA_ROOT, 'invoices', f'order_{order.id}.pdf')
            logger.info("PDF path: %s", pdf_path)

            with open(pdf_path, 'wb') as pdf_file:
                pdf_file.write(pdf_content)
            order.invoice = f'invoices/order_{order.id}.pdf'
            order.save(update_fields=['invoice'])
            logger.info("Invoice saved: %s", order.invoice)

            order_confirmation_email = render_to_string('order_confirmation_email.html', {
                'user': user,
                'order': order,
                'year': now().year
            })

            attachments = [{
                'filename': f'order_{order.id}.pdf',
                'content': pdf_content,
                'mime_type': 'application/pdf',
            }]

            if new_user:
                account_details_email = render_to_string('account_details_email.html', {
                    'user': user,
                    'year': now().year
                })
                send_order_email(
                    subject='Your New Account Details',
                    message=account_details_email,
                    recipient_list=[user.email],
                    attachments=attachments
                )
                logger.info("Account details email sent to: %s", user.email)

            send_order_email(
                subject='Order Confirmation',
                message=order_confirmation_email,
                recipient_list=[user.email],
                attachments=attachments
            )
            logger.info("Order confirmation email sent to: %s", user.email)

            serializer = OrderSerializer(order)
            logger.info("Order serialized successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValueError as ve:
        logger.error("ValueError: %s", ve)
        return Response({'detail': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error("Exception: %s", e)
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
