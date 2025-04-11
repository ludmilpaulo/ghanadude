from django.db import models
from django.contrib.auth.models import User
from revenue.models import Coupon
from product.models import Designer, Product

from dirtyfields import DirtyFieldsMixin

class Order(DirtyFieldsMixin, models.Model):
    ORDER_TYPE_CHOICES = [
        ('delivery', 'Delivery'),
        ('collection', 'Collect from Store'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Credit Card'),
        ('delivery', 'On Delivery'),
        ('eft', 'EFT'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
        default='delivery'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reward_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reward_granted = models.BooleanField(default=False)
    products = models.ManyToManyField(Product, through='OrderItem', related_name='orders')
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    invoice = models.FileField(upload_to='invoices/', blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
 

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = (('order', 'product'),)
        db_table = 'orders_orderitem'

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in order {self.order.id}"
    
    @property
    def dev_earnings(self):
        return round(self.price * self.quantity * (self.product.percentage / 100), 2)




class BulkOrder(models.Model):
    ORDER_TYPE_CHOICES = [
        ('delivery', 'Delivery'),
        ('collection', 'Collect from Store'),
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, related_name='bulk_orders', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='bulk_orders', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    brand_logo = models.ImageField(upload_to='bulk_order_logos/', null=True, blank=True)
    custom_design = models.ImageField(upload_to='bulk_order_designs/', null=True, blank=True)
    designer = models.ForeignKey(Designer, related_name='bulk_orders', null=True, blank=True, on_delete=models.SET_NULL)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
        default='delivery'
    )
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bulk Order #{self.id} by {self.user.username}"
    
    @property
    def dev_earnings(self):
        return round(self.product.price * self.quantity * (self.product.percentage / 100), 2)


