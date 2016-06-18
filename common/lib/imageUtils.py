from images.models import Image


def list_images():
    image_list = Image.objects.all().order_by('name')
    return image_list
