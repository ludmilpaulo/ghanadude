import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import FileField, ImageField
from django.core.files.storage import default_storage
from django.conf import settings
from .ftp_upload import upload_file_to_cpanel

def sync_all_filefields(instance):
    """
    Iterate through all FileField and ImageField instances and upload to FTP.
    """
    for field in instance._meta.fields:
        if isinstance(field, (FileField, ImageField)):
            file = getattr(instance, field.name)
            if file and default_storage.exists(file.name):
                try:
                    local_path = file.path
                    filename = os.path.basename(local_path)
                    upload_file_to_cpanel(local_path, filename)
                except Exception as e:
                    print(f"❌ Error uploading {field.name}: {e}")

@receiver(post_save)
def sync_media_files_on_save(sender, instance, **kwargs):
    """
    Automatically uploads any FileField/ImageField to cPanel via FTP.
    Only runs in production environment.
    """
    # ✅ Run only if DJANGO_ENV is set to 'prod'
    if os.environ.get("DJANGO_ENV") != "prod":
        return

    # ✅ Skip built-in Django/system models
    if not hasattr(instance, '_meta') or sender.__module__.startswith("django."):
        return

    try:
        sync_all_filefields(instance)
    except Exception as e:
        print(f"❌ FTP sync error: {e}")
