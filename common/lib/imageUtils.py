import logging
import openstackUtils
import osUtils
from images.models import Image
from wistar import configuration

logger = logging.getLogger(__name__)


def get_image_detail(image_id):
    """
    Get basic image details by image_id
    :param image_id: id of the image
    :return: Returns a dict of basic image details regardless of image location
    keys include:
    id - image id
    name - image name
    format - disk format (qcow2, ova, etc)
    size - image size in bytes
    file - file path or file URL
    local - boolean if stored locally
    """
    if configuration.deployment_backend == "openstack":
        glance_detail = openstackUtils.get_glance_image_detail(image_id)
        if glance_detail is not None:
            image_detail = get_image_detail_from_glance_image(glance_detail)

        if len(image_id) < 5:
            # this is not a glance image id!
            try:
                local_detail = Image.objects.get(pk=image_id)
                image_detail = get_image_detail_from_local_image(local_detail)
            except Exception:
                logger.info("image does not appear to be a glance image nor a local image!")
                return None

    else:
        try:
            local_detail = Image.objects.get(pk=image_id)
            image_detail = get_image_detail_from_local_image(local_detail)
        except Exception:
            logger.info("image does not appear to be a local image!")
            return None

    return image_detail


def get_image_detail_from_glance_image(glance_image):
    """
    Creates an image_detail dict from a glance image object
    :param glance_image: python object parsed from Glance REST API JSON
    :return: basic image_detail dict containing name, id, format, file, size, and local
    see get_image_detail for more information

    Example glance image return value:
    {
    "status": "active",
    "schema": "/v2/schemas/image",
    "name": "Ubuntu 140402 Openstack",
    "tags": [],
    "container_format": "bare",
    "created_at": "2016-06-28T14:11:51Z",
    "disk_format": "qcow2",
    "updated_at": "2016-06-28T14:12:05Z",
    "visibility": "public",
    "id": "5e6803de-e249-4704-8111-1a1d85a0160f",
    "owner": "1982c5ccfe5542b6a451daa2ec0b4c2f",
    "protected": false,
    "min_ram": 1024,
    "file": "/v2/images/5e6803de-e249-4704-8111-1a1d85a0160f/file",
    "checksum": "78da3b61143b8cc999ab328bf797168e",
    "min_disk": 1,
    "virtual_size": null,
    "self": "/v2/images/5e6803de-e249-4704-8111-1a1d85a0160f",
    "size": 2685337600
}

    """
    logger.debug(glance_image)
    image_detail = dict()
    image_detail["name"] = glance_image["name"]
    image_detail["id"] = glance_image["id"]
    image_detail["format"] = glance_image["disk_format"]
    image_detail["size"] = glance_image["size"]
    image_detail["file"] = glance_image["file"]
    image_detail["description"] = glance_image["size"]
    image_detail["local"] = False

    return image_detail


def get_image_detail_from_local_image(local_image):
    """
    Creates an image_detail dict from a local image object
    :param local_image: images.models.Image
    :return: basic image_detail dict containing name, id, type, size, and local
    see get_image_detail for more information
    """
    image_detail = dict()
    image_detail["name"] = local_image.name
    image_detail["id"] = local_image.id
    image_detail["description"] = local_image.description
    image_detail["format"] = "qcow2"
    if local_image.filePath != "":
        try:
            path = local_image.filePath.path
            image_detail["size"] = osUtils.get_image_size(path)
            image_detail["file"] = path
            image_detail["local"] = True
        except Exception as ve:
            logger.debug(str(ve))
            image_detail["size"] = 0
            image_detail["file"] = "None"
            image_detail["local"] = True
    else:
        # this image does not actually exist locally!
        image_detail["local"] = False

    logger.debug(image_detail)
    return image_detail


def get_image_list():
    """
    Get a list of images from the configured deployment backend
    :return: list of image_detail dicts
    """

    logger.debug('---- imageUtils get_image_list ----')

    image_list = list()
    if configuration.deployment_backend == "openstack":
        if openstackUtils.connect_to_openstack():
            images = openstackUtils.get_glance_image_list()
            for glance_detail in images["images"]:
                image_detail = get_image_detail_from_glance_image(glance_detail)
                image_list.append(image_detail)

    else:
        images = Image.objects.all()
        for local_detail in images:
            image_detail = get_image_detail_from_local_image(local_detail)
            image_list.append(image_detail)

    return image_list


def get_local_image_list():
    """
    Get a list of images from the local db
    :return: list of image_detail dicts
    """

    logger.debug('---- imageUtils get_local_image_list ----')

    image_list = list()

    images = Image.objects.all().order_by('name')
    for local_detail in images:
        image_detail = get_image_detail_from_local_image(local_detail)
        image_list.append(image_detail)

    return image_list


def get_glance_image_list():

    logger.debug('---- imageUtils get_glance_image_list ----')


    image_list = list()
    if configuration.deployment_backend == "openstack":
        if openstackUtils.connect_to_openstack():
            images = openstackUtils.get_glance_image_list()
            for glance_detail in images["images"]:
                image_detail = get_image_detail_from_glance_image(glance_detail)
                image_list.append(image_detail)

    return image_list
