from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    readonly_fields = ("created_at", "updated_at")  # Mark timestamps as readonly
    fk_name = "user"
    extra = 0


# Unregister the original User admin
admin.site.unregister(User)


# Re-register the User admin with profile inline
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super().get_inline_instances(request, obj)
