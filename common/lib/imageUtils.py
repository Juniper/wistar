#
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
#
# Copyright (c) 2015 Juniper Networks, Inc.
# All rights reserved.
#
# Use is subject to license terms.
#
# Licensed under the Apache License, Version 2.0 (the ?License?); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at http://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import logging
import openstackUtils
import osUtils
import re
from images.models import Image
from wistar import configuration
from wistar import settings

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
        if openstackUtils.connect_to_openstack():
            if type(image_id) is str and len(image_id) > 5:
                glance_detail = openstackUtils.get_glance_image_detail(image_id)
                return get_image_detail_from_glance_image(glance_detail)
            else:
                # this is not a glance image Id!
                local_detail = Image.objects.get(pk=image_id)
                image_detail = get_image_detail_from_local_image(local_detail)

                if 'name' not in image_detail:
                    logger.error('Could not get a name from the local image!')
                    return None

                return openstackUtils.get_glance_image_detail_by_name(image_detail['name'])

        else:
            raise Exception('Could not authenticate to Openstack')

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
    image_detail['status'] = glance_image["status"]

    default_size = 20000000000

    try:
        if 'size' not in glance_image:
            size = default_size
        elif glance_image["size"] is None:
            size = default_size
        else:
            size = int(glance_image["size"])

    except (TypeError, ValueError):
            logger.warn('Could not parse int value from glance image size')
            size = default_size

    try:
        if 'min_disk' not in glance_image:
            min_disk = 0
        elif glance_image['min_disk'] is None:
            min_disk = 0
        else:
            min_disk = int(glance_image['min_disk'])

    except (TypeError, ValueError):
        logger.warn('Could not parse int value from glance image min_disk')
        min_disk = 0

    image_detail['size'] = size
    image_detail['min_disk'] = min_disk

    image_detail["file"] = glance_image["file"]
    image_detail["description"] = image_detail["size"]
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
            for glance_detail in images:
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
            for glance_detail in images:
                image_detail = get_image_detail_from_glance_image(glance_detail)
                image_list.append(image_detail)

    return image_list


def image_exists(image_name):
    """
    Determine if an image exists with this name
    :param image_name: name of the image
    :return: Boolean True if image exists
    """
    image_list = get_image_list()
    for image in image_list:
        if "name" in image and image_name in image["name"]:
            return True

    return False


def create_local_image(name, description, file_path, image_type):
    """
    Register a local (server-side) image with Wistar
    :param name: name of the image
    :param description: Description of the image
    :param file_path: full path to the where the file exists on the server
    :param image_type: The wistar type of the image, this type must already be registered in Wistar
    :return: The local id of the image
    """
    if image_exists(name):
        logger.info('Image with this name already exists!')
        try:
            existing_image = Image.objects.get(name=name)
            return existing_image.id
        except Image.DoesNotExist:
            logger.error('Image already exists but we cannot get it locally!')
            pass

    if osUtils.check_path(file_path):
        logger.debug("path exists")
        if settings.MEDIA_ROOT not in file_path:
            raise Exception("Image must in in path: %s" % settings.MEDIA_ROOT)

        else:
            logger.debug("removing media_root")
            file_path = file_path.replace(settings.MEDIA_ROOT + '/', '')
            logger.debug(file_path)
    else:
        raise Exception("Invalid image path")

    try:
        logger.debug(file_path)
        image = Image()
        image.description = description
        image.name = name
        image.filePath = file_path
        image.type = image_type
        image.save()

        full_path = image.filePath.path

        if re.match(".*\.vmdk$", full_path):
            # we need to convert this for KVM based deployments!
            converted_image_path = re.sub("\.vmdk$", ".qcow2", full_path)
            converted_image_file_name = converted_image_path.split('/')[-1]
            if osUtils.convert_vmdk_to_qcow2(full_path, converted_image_path):
                logger.info("Converted vmdk image to qcow2!")
                image.filePath = "user_images/%s" % converted_image_file_name
                image.save()

                logger.debug("Removing original vmdk")
                osUtils.remove_instance(full_path)
            else:
                logger.error("Could not convert vmdk!")

        if image_type == "junos_vre_15" and "jinstall64-vmx-15.1" in full_path:
            logger.debug("Creating RIOT image for Junos vMX 15.1")
            # lets replace the last "." with "_riot."
            if '.' in file_path:
                new_image_path = re.sub(r"(.*)\.(.*)$", r"\1_riot.\2", full_path)
            else:
                # if there is no '.', let's just add one
                new_image_path = full_path + "_riot.img"

            new_image_file_name = new_image_path.split('/')[-1]
            new_image_name = name + ' Riot PFE'
            if osUtils.copy_image_to_clone(full_path, new_image_path):
                logger.debug("Copied from %s" % full_path)
                logger.debug("Copied to %s" % new_image_path)
                n_image = Image()
                n_image.name = new_image_name
                n_image.type = "junos_riot"
                n_image.description = image.description + "\nRiot PFE"
                n_image.filePath = "user_images/" + new_image_file_name
                n_image.save()

        return image.id

    except Exception as e:
        logger.error("Caught Error in create_local_image")
        logger.error(str(e))
        raise


def delete_image_by_id(image_id):

    try:
        image = Image.objects.get(pk=image_id)
        delete_image(image)
    except Image.DoesNotExist:
        logger.error("Image does not exist!")


def delete_image_by_name(image_name):

    try:
        image = Image.objects.get(name=image_name)
        delete_image(image)
    except Image.DoesNotExist:
        logger.error("Image does not exist!")


def delete_image(image):
    try:
        image.filePath.delete()
    except Exception as e:
        logger.error(str(e))
    finally:
        image.delete()
