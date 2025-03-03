from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import User



class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.ImageField(upload_to='brand_logos/', null=True, blank=True)

    def __str__(self):
        return self.name

class Designer(models.Model):
    name = models.CharField(max_length=255)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='designers')

    def __str__(self):
        return self.name

class Product(models.Model):
    SEASON_CHOICES = [
        ('summer', 'Summer'),
        ('winter', 'Winter'),
        ('all_seasons', 'All Seasons'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    stock = models.PositiveIntegerField(default=0)
    on_sale = models.BooleanField(default=False)
    discount_percentage = models.PositiveIntegerField(default=0)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all_seasons')

    def __str__(self):
        return self.name

    def reduce_stock(self, quantity):
        if self.stock >= quantity:
            self.stock -= quantity
            self.save()
            if self.stock < 10:
                self.notify_low_stock()
        else:
            raise ValueError("Insufficient stock")

    def notify_low_stock(self):
        send_mail(
            'Low Stock Alert',
            f'The stock for {self.name} is below 10. Please restock soon.',
            'admin@example.com',
            ['admin@example.com'],
            fail_silently=False,
        )

class Image(models.Model):
    product = models.ForeignKey(Product, related_name='product_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
