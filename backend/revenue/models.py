import uuid
from django.db import models
from django.contrib.auth.models import User

class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coupons')
    value = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)  # R50 default
    is_redeemed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Coupon {self.code} for {self.user.username}"
# In Order model
@property
def earned_points(self):
    return (self.total_price // 100) * 1  # 1% for every R100
