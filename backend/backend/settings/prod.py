from .base import *

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
    }
}


MEDIA_URL = "https://ghanadude.com/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "static_cdn", "media_root")
