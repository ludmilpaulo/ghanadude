from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*"])

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT", default="5432"),
        "OPTIONS": {
            "sslmode": "require",  # Supabase requires SSL
        },
    }
}

# Supabase Storage (S3-compatible)
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_STORAGE_BUCKET_NAME = "ghanadude"
AWS_S3_ENDPOINT_URL = "https://ucekkzhmdgmcenhvxary.supabase.co/storage/v1/s3"
AWS_S3_REGION_NAME = "us-west-1"
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")
AWS_QUERYSTRING_AUTH = False  # Make URLs publicly accessible

# Media URLs (can be used in frontend if needed)
MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"
MEDIA_ROOT = os.path.join(BASE_DIR, "static_cdn", "media_root")
