from django.shortcuts import render, get_object_or_404

from django.http import HttpResponseRedirect
from django.contrib import messages

import common.lib.osUtils as ou
import wistar.settings as settings

from images.models import Image
from images.models import ImageForm
import common.lib.libvirtUtils as lu


# FIXME = debug should be a global setting
debug = True


def index(request):
    image_list = Image.objects.all().order_by('modified')
    context = {'image_list': image_list}
    return render(request, 'images/index.html', context)


def edit(request, image_id):
    image = get_object_or_404(Image, pk=image_id)
    return render(request, 'images/edit.html', {'image': image})


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
        return HttpResponseRedirect('/images/')

    else:
        if "image_id" in request.POST:
            image_id = request.POST["image_id"]
            image = get_object_or_404(Image, pk=image_id)
            return render(request, 'edit.html', {'image': image})
        else:
            return HttpResponseRedirect('/images/')


def new(request):
    image_form = ImageForm()
    context = {'image_form': image_form}
    return render(request, 'images/new.html', context)


def create(request):
    image_form = ImageForm(request.POST, request.FILES)
    if image_form.is_valid():
        # if not osUtils.checkPath(image_form.cleaned_data['path']):
        # print "PATH DOESN'T EXIST"
        # context = {'error' : "PATH DOESNT EXIST"}
        #    return render(request, 'images/error.html', context)

        print "Saving form"
        image_form.save()
        return HttpResponseRedirect('/images')
    else:
        context = {'error': "Form isn't valid!"}
        return render(request, 'images/error.html', context)


def block_pull(request, uuid):
    domain = lu.get_domain_by_uuid(uuid)
    domain_name = domain.name()
    image_path = lu.get_image_for_domain(domain.UUIDString())

    if ou.is_image_thin_provisioned(image_path):
        print "Found thinly provisioned image, promoting..."
        rv = lu.promote_instance_to_image(domain_name)

        if rv is None:
            messages.info(request, "Image already promoted. Shut down the instance to perform a clone.")
        elif rv:
            messages.info(request, "Promoting thinly provisioned image")
        else:
            messages.info(request, "Error Promoting image!")

    else:
        messages.info(request, "Image is already promoted. You may now shutdown the image and perform a Clone")
        print "Image is already promoted"

    return HttpResponseRedirect('/ajax/manageHypervisor/')


def create_from_instance(request, uuid):
    print "Creating new image from instance"
    domain = lu.get_domain_by_uuid(uuid)

    print "got domain " + domain.name()
    domain_image = lu.get_image_for_domain(uuid)
    print "got domain_image: " + domain_image

    if ou.is_image_thin_provisioned(domain_image):
        print "Cannot clone disk that is thinly provisioned! Please perform a block pull before continueing"
        context = {'error': "Cannot Clone thinly provisioned disk! Please perform a block pull!"}
        return render(request, 'images/error.html', context)

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

    if ou.check_path(new_full_image_path):
        print "Image has already been cloned"
        context = {'error': "Instance has already been cloned!"}
        return render(request, 'images/error.html', context)

    print "Copying image from " + domain_image

    print "To " + new_full_image_path

    ou.copy_image_to_clone(domain_image, new_full_image_path)

    image = Image()
    image.name = "image_" + str(domain.UUIDString())
    image.description = "Clone of " + domain_name
    image.filePath = new_relative_image_path
    image.save()
    return HttpResponseRedirect('/images/')


def detail(request, image_id):
    image = get_object_or_404(Image, pk=image_id)
    return render(request, 'images/details.html', {'image': image})


def delete(request, image_id):
    image = get_object_or_404(Image, pk=image_id)
    image.filePath.delete()
    image.delete()
    return HttpResponseRedirect('/images/')


def error(request):
    context = {'error': "Unknown Error"}
    return render(request, 'images/error.html', context)


