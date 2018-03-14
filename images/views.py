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
import re

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404

from common.lib import imageUtils
from common.lib import libvirtUtils
from common.lib import openstackUtils
from common.lib import osUtils
from images.models import Image
from images.models import ImageBlankForm
from images.models import ImageForm
from images.models import ImageLocalForm
from wistar import configuration
from wistar import settings

logger = logging.getLogger(__name__)


def index(request):
    image_list = imageUtils.get_local_image_list()
    context = {'image_list': image_list}
    return render(request, 'images/index.html', context)


def edit(request, image_id):
    image = get_object_or_404(Image, pk=image_id)

    #     template = get_object_or_404(ConfigTemplate, pk=template_id)
    # template_form = ConfigTemplateForm(instance=template)
    image_form = ImageForm(instance=image)
    return render(request, 'images/edit.html', {'image': image, 'image_form': image_form})


def update(request):
    if "name" in request.POST:
        image_id = request.POST["image_id"]
        image_name = request.POST["name"]
        image_description = request.POST["description"]
        image_type = request.POST["type"]

        image = get_object_or_404(Image, pk=image_id)
        image.name = image_name
        image.description = image_description
        image.type = image_type
        image.save()
        messages.info(request, "Image updated")
        return HttpResponseRedirect('/images/')

    else:
        if "image_id" in request.POST:
            image_id = request.POST["image_id"]
            image = get_object_or_404(Image, pk=image_id)
            messages.info(request, "Image updated")
            return render(request, 'edit.html', {'image': image})
        else:
            messages.info(request, "Could not update image! No name or ID found in request!")
            return HttpResponseRedirect('/images/')


def new(request):
    image_form = ImageForm()
    context = {'image_form': image_form, "vm_types": configuration.vm_image_types}
    return render(request, 'images/new.html', context)


def create(request):
    try:
        logger.debug('---- Create Image ----')
        image_form = ImageForm(request.POST, request.FILES)
        if not image_form.is_valid():
            logger.error("Could not save image for some reason!")
            context = {'image_form': image_form}
            return render(request, 'images/new.html', context)


        # if not osUtils.checkPath(image_form.cleaned_data['path']):
        # logger.debug("PATH DOESN'T EXIST")
        # context = {'error' : "PATH DOESNT EXIST"}
        #    return render(request, 'error.html', context)

        logger.debug("Saving form")
        orig_image = image_form.save()
        messages.info(request, "Image uploaded successfully")

        image_type = request.POST["type"]
        image_name = request.POST["name"]
        full_path = orig_image.filePath.path

        if re.match(".*\.vmdk$", full_path):
            # we need to convert this for KVM based deployments!
            converted_image_path = re.sub("\.vmdk$", ".qcow2", full_path)
            converted_image_file_name = converted_image_path.split('/')[-1]
            if osUtils.convert_vmdk_to_qcow2(full_path, converted_image_path):
                logger.info("Converted vmdk image to qcow2!")
                orig_image.filePath = "user_images/%s" % converted_image_file_name
                orig_image.save()

                logger.debug("Removing original vmdk")
                osUtils.remove_instance(full_path)
            else:
                logger.error("Could not convert vmdk!")

        if image_type == "junos_vre_15" and "jinstall64-vmx-15.1" in full_path:
            logger.debug("Creating RIOT image for Junos vMX 15.1")
            # lets replace the last "." with "_riot."
            if '.' in full_path:
                new_image_path = re.sub(r"(.*)\.(.*)$", r"\1_riot.\2", full_path)
            else:
                # if there is no '.', let's just add one
                new_image_path = full_path + "_riot.img"

            new_image_file_name = new_image_path.split('/')[-1]
            new_image_name = image_name + ' Riot PFE'
            if osUtils.copy_image_to_clone(full_path, new_image_path):
                logger.debug("Copied from %s" % full_path)
                logger.debug("Copied to %s" % new_image_path)
                image = Image()
                image.name = new_image_name
                image.type = "junos_riot"
                image.description = orig_image.description + "\nRiot PFE"
                image.filePath = "user_images/" + new_image_file_name
                image.save()

        return HttpResponseRedirect('/images')

    except Exception as e:
        logger.error(e)
        messages.info(request, "Could not create image!")
        return HttpResponseRedirect('/images/')


def blank(request):
    image_form = ImageBlankForm()
    context = {'image_form': image_form}
    return render(request, 'images/new_blank.html', context)


def local(request):
    image_form = ImageLocalForm()
    context = {'image_form': image_form}
    return render(request, 'images/new_local.html', context)


def create_blank(request):
    image_form = ImageBlankForm(request.POST)
    logger.debug(image_form)
    logger.debug(str(image_form))
    if image_form.is_valid():

        name = request.POST["name"]
        size = request.POST["size"]
        description = request.POST["description"]

        file_path = 'user_images/' + name

        if ".img" not in file_path:
            file_path += ".img"

        full_path = settings.MEDIA_ROOT + "/" + file_path

        if osUtils.create_blank_image(full_path, size + 'G'):
            image = Image()
            image.description = description
            image.name = name
            image.filePath = file_path
            image.type = 'blank'
            image.save()

        # if not osUtils.checkPath(image_form.cleaned_data['path']):
        # logger.debug("PATH DOESN'T EXIST")
        # context = {'error' : "PATH DOESNT EXIST"}
        #    return render(request, 'error.html', context)

        logger.debug("Saving form")
        # image_form.save()
        return HttpResponseRedirect('/images')
    else:
        context = {'image_form': image_form}
        return render(request, 'images/new_blank.html', context)


def create_local(request):
    name = request.POST["name"]
    file_path = request.POST["filePath"]
    description = request.POST["description"]
    image_type = request.POST["type"]

    try:
        imageUtils.create_local_image(name, description, file_path, image_type)

    except Exception as e:
        context = {'error': str(e)}
        return render(request, 'error.html', context)

    messages.info(request, "Image Created!")
    return HttpResponseRedirect('/images')


def block_pull(request, uuid):
    domain = libvirtUtils.get_domain_by_uuid(uuid)
    domain_name = domain.name()
    image_path = libvirtUtils.get_image_for_domain(domain.UUIDString())

    if osUtils.is_image_thin_provisioned(image_path):
        logger.debug("Found thinly provisioned image, promoting...")
        rv = libvirtUtils.promote_instance_to_image(domain_name)

        if rv is None:
            messages.info(request, "Image already promoted. Shut down the instance to perform a clone.")
        elif rv:
            messages.info(request, "Promoting thinly provisioned image")
        else:
            messages.info(request, "Error Promoting image!")

    else:
        messages.info(request, "Image is already promoted. You may now shutdown the image and perform a Clone")
        logger.debug("Image is already promoted")

    return HttpResponseRedirect('/ajax/manageHypervisor/')


def create_from_instance(request, uuid):
    logger.debug("Creating new image from instance")
    domain = libvirtUtils.get_domain_by_uuid(uuid)

    logger.debug("got domain " + domain.name())
    domain_image = libvirtUtils.get_image_for_domain(uuid)
    logger.debug("got domain_image: " + domain_image)

    if osUtils.is_image_thin_provisioned(domain_image):
        logger.error("Cannot clone disk that is thinly provisioned! Please perform a block pull before continuing")
        context = {'error': "Cannot Clone thinly provisioned disk! Please perform a block pull!"}
        return render(request, 'error.html', context)

    domain_name = domain.name()

    # FIXME - make these variable names a bit more clear about their meaning
    # we need to get the path of the image relative to the MEDIA_ROOT
    media_root = settings.MEDIA_ROOT
    media_root_array = media_root.split("/")
    len_media_root = len(media_root_array)

    full_path_array = domain_image.split("/")
    full_path = "/".join(full_path_array[:full_path_array.index('instances')])

    # grab the file path of the domain image without the MEDIA_ROOT prepended
    file_path_array = domain_image.split('/')[len_media_root:]
    images_dir = "/".join(file_path_array[:file_path_array.index('instances')])

    new_relative_image_path = images_dir + "/image_" + str(domain.UUIDString()) + ".img"
    new_full_image_path = full_path + "/image_" + str(domain.UUIDString()) + ".img"

    if osUtils.check_path(new_full_image_path):
        logger.info("Image has already been cloned")
        context = {'error': "Instance has already been cloned!"}
        return render(request, 'error.html', context)

    logger.debug("Copying image from " + domain_image)

    logger.debug("To " + new_full_image_path)

    osUtils.copy_image_to_clone(domain_image, new_full_image_path)

    image = Image()
    image.name = "image_" + str(domain.UUIDString())
    image.description = "Clone of " + domain_name
    image.filePath = new_relative_image_path
    image.save()
    return HttpResponseRedirect('/images/')


def detail(request, image_id):
    image = get_object_or_404(Image, pk=image_id)

    vm_type = "N/A"
    for vt in configuration.vm_image_types:
        if vt["name"] == image.type:
            vm_type = vt["description"]
            break

    glance_id = ""
    image_state = ""

    if configuration.deployment_backend == "openstack":
        openstackUtils.connect_to_openstack()
        glance_id = openstackUtils.get_image_id_for_name(image.name)
    elif configuration.deployment_backend == "kvm" and image.filePath != "":
        image_state = osUtils.is_image_thin_provisioned(image.filePath.path)

    return render(request, 'images/details.html', {'image': image,
                                                   'state': image_state,
                                                   "vm_type": vm_type,
                                                   "settings": settings,
                                                   "glance_id": glance_id,
                                                   "use_openstack": configuration.use_openstack,
                                                   "openstack_host": configuration.openstack_host
                                                   })


def glance_detail(request):
    """
    OpenStack specific action to get image details from Glance
    :param request: HTTPRequest
    :return: rendered HTML
    """
    required_fields = set(['imageId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    image_id = request.POST["imageId"]

    image = get_object_or_404(Image, pk=image_id)

    if openstackUtils.connect_to_openstack():
        glance_id = openstackUtils.get_image_id_for_name(image.name)

        glance_json = dict()
        if glance_id is not None:
            glance_json = openstackUtils.get_glance_image_detail(glance_id)
            logger.debug("glance json of %s is" % glance_id)
            logger.debug(glance_json)
            logger.debug("---")

        return render(request, 'images/glance_detail.html', {'image': glance_json,
                                                             "image_id": image_id,
                                                             "glance_id": glance_id,
                                                             "openstack_host": configuration.openstack_host
                                                             })
    else:
        return render(request, 'error.html', {'error': "Could not connect to OpenStack"})


def glance_list(request):
    image_list = imageUtils.get_glance_image_list()
    context = {'image_list': image_list}
    return render(request, 'images/glance_list.html', context)


def delete(request, image_id):
    imageUtils.delete_image_by_id(image_id)
    messages.info(request, "Image deleted!")
    return HttpResponseRedirect('/images/')


def list_glance_images(request):
    if openstackUtils.connect_to_openstack():
        image_list = openstackUtils.list_glance_images()

        context = {'error': image_list}
        return render(request, 'error.html', context)

    context = {'error': "Could not connect to OpenStack"}
    return render(request, 'error.html', context)


def upload_to_glance(request, image_id):
    if openstackUtils.connect_to_openstack():
        image = get_object_or_404(Image, pk=image_id)
        logger.debug("Uploading now!")
        if osUtils.check_path(image.filePath.path):
            openstackUtils.upload_image_to_glance(image.name, image.filePath.path)

        logger.debug("All done")
        return HttpResponseRedirect('/images/%s' % image_id)


def import_from_glance(request, glance_id):
    """
    Creates a local db entry for the glance image
    Everything in Wistar depends on a db entry in the Images table
    If you have an existing openstack cluster, you may want to import those
    images here without having to physically copy the images to local disk
    :param request: HTTPRequest object
    :param glance_id: id of the glance image to import
    :return: redirect to /images/image_id
    """
    if openstackUtils.connect_to_openstack():
        image_details = openstackUtils.get_glance_image_detail(glance_id)
        image = Image()
        image.description = "Imported from Glance"
        image.name = image_details["name"]
        image.type = 'blank'
        image.save()
        logger.debug("All done")
        return HttpResponseRedirect('/images/%s' % image.id)

    context = {'error': "Could not connect to OpenStack"}
    return render(request, 'error.html', context)


def error(request):
    context = {'error': "Unknown Error"}
    return render(request, 'error.html', context)
