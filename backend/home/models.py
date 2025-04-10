from django.db import models

class AppVersion(models.Model):
    PLATFORM_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
    ]

    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, unique=True)
    latest_version = models.CharField(max_length=20)
    store_url = models.URLField()
    force_update = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.platform.upper()} v{self.latest_version}"
    
    
    
    
class DevPayment(models.Model):
    invoice = models.FileField(upload_to='dev_invoices/')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Dev Payment - R{self.amount} on {self.created_at.strftime('%Y-%m-%d')}"



class SiteSetting(models.Model):
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    address = models.CharField(max_length=255, default="205 Victoria Rd, Woodstock, Cape Town, 7925")
    country = models.CharField(max_length=100, default="South Africa")

    def __str__(self):
        return "Global Site Settings"

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"
