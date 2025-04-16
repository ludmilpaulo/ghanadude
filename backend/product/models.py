from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field

from utils.supabase import SUPABASE_PUBLIC_BASE


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.ImageField(upload_to="brand_logos/", null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        return f"{SUPABASE_PUBLIC_BASE}/{self.logo.name}" if self.logo else None


class Designer(models.Model):
    name = models.CharField(max_length=255)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="designers")

    def __str__(self):
        return self.name


class Image(models.Model):
    image = models.ImageField(
        max_length=3000, default=None, blank=True, upload_to="product_images/"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Image"
        verbose_name_plural = "Products Images"

    def __str__(self):
        return self.image.name if self.image else "No Image"

    @property
    def url(self):
        if self.image:
            return f"{SUPABASE_PUBLIC_BASE}/{self.image.name}"
        return None


class Size(models.Model):
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    SEASON_CHOICES = [
        ("summer", "Summer"),
        ("winter", "Winter"),
        ("all_seasons", "All Seasons"),
    ]

    name = models.CharField(max_length=255)
    description = CKEditor5Field("Text", config_name="extends")
    images = models.ManyToManyField("Image")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="products"
    )
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="products")
    sizes = models.ManyToManyField(Size, blank=True)
    stock = models.PositiveIntegerField(default=0)
    on_sale = models.BooleanField(default=False)
    percentage = models.DecimalField(
        max_digits=5, decimal_places=1, default=3
    )  # % markup
    bulk_sale = models.BooleanField(default=False)
    discount_percentage = models.PositiveIntegerField(default=0)
    season = models.CharField(
        max_length=20, choices=SEASON_CHOICES, default="all_seasons"
    )

    def __str__(self):
        return self.name

    @property
    def price_with_markup(self):
        return self.price * (1 + self.percentage / 100)

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
            "Low Stock Alert",
            f"The stock for {self.name} is below 10. Please restock soon.",
            "admin@example.com",
            ["admin@example.com"],
            fail_silently=False,
        )

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"

    @property
    def category_name(self):
        return self.category.name if self.category else ""

    @property
    def image_urls(self):
        return [image.image.url for image in self.images.all()]


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="wishlisted_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

    class Meta:
        unique_together = ("user", "product")


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, related_name="reviews", on_delete=models.CASCADE
    )
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(User, related_name="liked_reviews", blank=True)
    dislikes = models.ManyToManyField(User, related_name="disliked_reviews", blank=True)

    def like_count(self):
        return self.likes.count()

    def dislike_count(self):
        return self.dislikes.count()

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
