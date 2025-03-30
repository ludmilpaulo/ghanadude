from django.contrib import admin
from .models import AppVersion

@admin.register(AppVersion)
class AppVersionAdmin(admin.ModelAdmin):
    list_display = ('platform', 'latest_version', 'force_update', 'updated_at')
    list_filter = ('platform', 'force_update')
    search_fields = ('platform', 'latest_version')
