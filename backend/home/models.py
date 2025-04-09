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
