from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect, HttpResponse
from images.models import Image
from images.models import ImageForm
from common.lib import osUtils
import logging
import time
import json

# FIXME = debug should be a global setting
debug = True

def index(request):
    image_list = Image.objects.all().order_by('modified')[:10]
    context = {'image_list': image_list}
    return render(request, 'images/index.html', context)

def edit(request):
    return render(request, 'edit.html')

def new(request):
    image_form = ImageForm()
    context = {'image_form' : image_form}
    return render(request, 'images/new.html', context)

def create(request):
    image_form = ImageForm(request.POST)
    if image_form.is_valid():
        if not osUtils.checkPath(image_form.cleaned_data['path']):
            print "PATH DOESN'T EXIST"
            context = {'error' : "PATH DOESNT EXIST"}
            return render(request, 'error.html', context)

        print "Saving form"
        image_form.save()
        return HttpResponseRedirect('/images')
    else:
        context = {'error' : "FORM ISN'T VALID"}
        return render(request, 'error.html', context)


def detail(request, image_id):
    image  = get_object_or_404(Image, pk=image_id)
    return render(request, 'edit.html', {'image': image})

def delete(request, image_id):
    image  = get_object_or_404(Image, pk=image_id)
    image.delete()
    return HttpResponseRedirect('/images/')

def error(request):
    return render(request, 'error.html')

