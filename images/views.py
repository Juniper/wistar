from django.shortcuts import render, get_object_or_404

from django.http import HttpResponseRedirect

import common.lib.osUtils as ou

from images.models import Image
from images.models import ImageForm
import common.lib.libvirtUtils as lu


# FIXME = debug should be a global setting
debug = True


def index(request):
    image_list = Image.objects.all().order_by('modified')
    context = {'image_list': image_list}
    return render(request, 'images/index.html', context)


def edit(request):
    if "name" in request.POST:
        image_id = request.POST["image_id"]
        image_name = request.POST["name"]
        image_description = request.POST["description"]

        image = get_object_or_404(Image, pk=image_id)
        image.name = image_name
        image.description = image_description
        image.save()
        return HttpResponseRedirect('/images/')

    else:
        if "image_id" in request.POST:
            image_id = request.POST["image_id"]
            image = get_object_or_404(Image, pk=image_id)
            return render(request, 'edit.html', {{'image': image}})
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
        #    context = {'error' : "PATH DOESNT EXIST"}
        #    return render(request, 'images/error.html', context)

        print "Saving form"
        image_form.save()
        return HttpResponseRedirect('/images')
    else:
        context = {'error': "Form isn't valid!"}
        return render(request, 'images/error.html', context)


def block_pull(request, uuid):
    print "Performing blockPull on domain"
    domain = lu.get_domain_by_uuid(uuid)
    domain_name = domain.name()
    lu.clone_domain(domain_name)
    return HttpResponseRedirect('/images')


def create_from_instance(request, uuid):
    print "Creating new image from instance"
    domain = lu.get_domain_by_uuid(uuid)

    print "got domain " + domain.name()
    domain_image = lu.get_image_for_domain(uuid)

    domain_name = domain.name()

    file_path_array = domain_image.split('/')
    images_dir = "/".join(file_path_array[:file_path_array.index('instances')])

    new_image_path = images_dir + "/image_" + str(domain.ID()) + ".img"
    print "Copying image from " + domain_image

    print "To " + new_image_path

    ou.copy_image_to_clone(domain_image, new_image_path)

    image = Image()
    image.name = "image_" + str(domain.ID())
    image.description = "Clone of " + domain_name
    image.filePath = new_image_path
    image.save()
    return HttpResponseRedirect('/images')


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


