from django.db import models


class SiteMeta(models.Model):
    # ✅ Supabase-hosted logo
    logo = models.ImageField(
        upload_to="site_logo/",
        blank=True,
        null=True,
        help_text="Primary logo displayed in emails and frontend."
    )

    # ✅ Social media links (all optional)
    facebook_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    whatsapp_url = models.URLField(blank=True, null=True)
    tiktok_url = models.URLField(blank=True, null=True)
    pinterest_url = models.URLField(blank=True, null=True)
    snapchat_url = models.URLField(blank=True, null=True)
    telegram_url = models.URLField(blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Site Meta & Socials"

    class Meta:
        verbose_name = "Site Meta"
        verbose_name_plural = "Site Meta"
class AppVersion(models.Model):
    PLATFORM_CHOICES = [
        ("ios", "iOS"),
        ("android", "Android"),
    ]

    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, unique=True)
    latest_version = models.CharField(max_length=20)
    store_url = models.URLField()  # ✅ Allows linking to App Store or Play Store
    force_update = models.BooleanField(default=True)  # ✅ Forces user to update
    updated_at = models.DateTimeField(auto_now=True)  # ✅ Tracks last change

    def __str__(self):
        return f"{self.platform.upper()} v{self.latest_version}"


class DevPayment(models.Model):
    invoice = models.FileField(upload_to="dev_invoices/")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Dev Payment - R{self.amount} on {self.created_at.strftime('%Y-%m-%d')}"


class SiteSetting(models.Model):
    brand_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    custom_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimatedWeight = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    internationalRate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    address = models.CharField(
        max_length=255, default="205 Victoria Rd, Woodstock, Cape Town, 7925"
    )
    country = models.CharField(max_length=100, default="South Africa")

    def __str__(self):
        return "Global Site Settings"

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"
