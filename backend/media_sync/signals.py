import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import FileField, ImageField
from django.conf import settings

from .upload_file_to_supabase import upload_file_to_supabase

@receiver(post_save)
def upload_media_to_supabase(sender, instance, **kwargs):
    # only in production
    if os.getenv("DJANGO_ENV") != "prod":
        return

    # skip built‑in or Django internals
    if sender._meta.app_label in ("contenttypes", "auth", "admin", "sessions"):
        return

    # for every FileField or ImageField on this model
    for field in sender._meta.fields:
        if isinstance(field, (FileField, ImageField)):
            file_field = getattr(instance, field.name)
            if file_field and hasattr(file_field, "path"):
                local_path = file_field.path
                remote_path = file_field.name
                if os.path.exists(local_path):
                    upload_file_to_supabase(local_path, remote_path)
