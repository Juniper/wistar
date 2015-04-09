from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect

from images.models import Image
from images.models import ImageForm


# FIXME = debug should be a global setting
debug = True


def index(request):
    image_list = Image.objects.all().order_by('modified')
    context = {'image_list': image_list}
    return render(request, 'images/index.html', context)


def edit(request):
    return render(request, 'edit.html')


def new(request):
    image_form = ImageForm()
    context = {'image_form' : image_form}
    return render(request, 'images/new.html', context)


def create(request):
    image_form = ImageForm(request.POST, request.FILES)
    if image_form.is_valid():
        # if not osUtils.checkPath(image_form.cleaned_data['path']):
        #    print "PATH DOESN'T EXIST"
        #    context = {'error' : "PATH DOESNT EXIST"}
        #    return render(request, 'images/error.html', context)

        print "Saving form"
        image_form.save()
        return HttpResponseRedirect('/images')
    else:
        context = {'error' : "Form isn't valid!"}
        return render(request, 'images/error.html', context)


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

