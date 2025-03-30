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
