from django.contrib import admin
from .models import AppVersion, DevPayment

@admin.register(AppVersion)
class AppVersionAdmin(admin.ModelAdmin):
    list_display = ('platform', 'latest_version', 'force_update', 'updated_at')
    list_filter = ('platform', 'force_update')
    search_fields = ('platform', 'latest_version')
    
    


@admin.register(DevPayment)
class DevPaymentAdmin(admin.ModelAdmin):
    list_display = ('amount', 'created_at', 'invoice')
