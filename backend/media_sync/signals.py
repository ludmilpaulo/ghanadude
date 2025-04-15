import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import FileField, ImageField
from django.core.files.storage import default_storage
from .ftp_upload import upload_file_to_cpanel


@receiver(post_save)
def sync_media_files_on_save(sender, instance, **kwargs):
   
    env = os.environ.get("DJANGO_ENV")
   

    if env != "prod":
       
        return

    if not hasattr(instance, "_meta") or sender.__module__.startswith("django."):
       
        return

    for field in instance._meta.fields:
        if isinstance(field, (FileField, ImageField)):
            file = getattr(instance, field.name)
            if file:
                print(f"📁 Field found: {field.name} → {file.name}")
                try:
                    local_path = file.path
                    remote_path = file.name
                    print(f"⬆️ Uploading: {local_path} → {remote_path}")
                    upload_file_to_cpanel(local_path, remote_path)
                except Exception as e:
                    print(f"❌ Upload failed for {field.name}: {e}")
                    print(
                        f"📎 Tried path: {getattr(file, 'path', 'unknown')} → {getattr(file, 'name', 'unknown')}"
                    )
            else:
                print(f"⚠️ FileField {field.name} is empty.")
