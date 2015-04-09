from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect

from templates.models import ConfigTemplate
from templates.models import ConfigTemplateForm



# FIXME = debug should be a global setting
debug = True


def index(request):
    template_list = ConfigTemplate.objects.all().order_by('modified')
    context = {'template_list': template_list}
    return render(request, 'configTemplates/index.html', context)


def new(request):
    template_form = ConfigTemplateForm()
    context = {'template_form': template_form}
    return render(request, 'configTemplates/new.html', context)


def edit(request, template_id):
    template = get_object_or_404(ConfigTemplate, pk=template_id)
    template_form = ConfigTemplateForm(instance=template)
    context = {'template_form': template_form, 'template': template}
    return render(request, 'configTemplates/edit.html', context)


def update(request):
    try:
        if "id" in request.POST:
            template_id = request.POST['id']
            template = get_object_or_404(ConfigTemplate, pk=template_id)
            template.name = request.POST['name']
            template.description = request.POST['description']
            template.template= request.POST['template']
            template.save()
            return HttpResponseRedirect('/templates')
        else:
            return render(request, 'templates/error.html', {
                'error_message': "Invalid data in POST"
            })

    except KeyError:
        return render(request, 'templates/error.html', {
            'error_message': "Invalid data in POST"
        })


def create(request):
    template_form = ConfigTemplateForm(request.POST, request.FILES)
    if template_form.is_valid():
        print "Saving form"
        template_form.save()
        return HttpResponseRedirect('/templates')
    else:
        context = {'error': "Form isn't valid!"}
        return render(request, 'configTemplates/error.html', context)


def detail(request, template_id):
    template = get_object_or_404(ConfigTemplate, pk=template_id)
    return render(request, 'configTemplates/details.html', {'template': template})


def delete(request, template_id):
    template = get_object_or_404(ConfigTemplate, pk=template_id)
    template.filePath.delete()
    template.delete()
    return HttpResponseRedirect('/templates')


def error(request):
    context = {'error': "Unknown Error"}
    return render(request, 'configTemplates/error.html', context)

