from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile

def resize_image(image_field, size=(800, 800)):
    img = Image.open(image_field)
    img.convert('RGB')  # Convert image to RGB (to ensure JPG compatibility)
    img.thumbnail(size, Image.LANCZOS)

    # Save resized image to memory
    img_io = BytesIO()
    img.save(img_io, format='JPEG', quality=85)  # adjust quality as needed

    # Return new Django-compatible image
    return ContentFile(img_io.getvalue(), image_field.name)
