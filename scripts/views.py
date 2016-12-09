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

from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404

from scripts.models import ConfigTemplate
from scripts.models import ConfigTemplateForm
from scripts.models import Script
from scripts.models import ScriptForm

logger = logging.getLogger(__name__)


def index(request):
    template_list = ConfigTemplate.objects.all().order_by('modified')
    script_list = Script.objects.all().order_by('modified')
    context = {'template_list': template_list, 'script_list': script_list}
    return render(request, 'configTemplates/index.html', context)


def new_template(request):
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
            template.template = request.POST['template']
            template.save()
            return HttpResponseRedirect('/scripts')
        else:
            return render(request, 'error.html', {
                'error': "Invalid data in POST"
            })

    except KeyError:
        return render(request, 'error.html', {
            'error': "Invalid data in POST"
        })


def create(request):
    template_form = ConfigTemplateForm(request.POST, request.FILES)
    if template_form.is_valid():
        logger.debug("Saving form")
        template_form.save()
        return HttpResponseRedirect('/scripts')
    else:
        context = {'error': "Form isn't valid!"}
        return render(request, 'error.html', context)


def detail(request, template_id):
    template = get_object_or_404(ConfigTemplate, pk=template_id)
    return render(request, 'configTemplates/details.html', {'template': template})


def delete(request, template_id):
    template = get_object_or_404(ConfigTemplate, pk=template_id)
    template.delete()
    return HttpResponseRedirect('/scripts')


def error(request):
    context = {'error': "Unknown Error"}
    return render(request, 'error.html', context)


def new_script(request):
    script_form = ScriptForm()
    context = {'script_form': script_form}
    return render(request, 'scripts/new.html', context)


def create_script(request):
    required_fields = set(['name', 'description', 'script'])
    if not required_fields.issubset(request.POST):
        return render(request, 'error.html', {
            'error': "Form isn't valid!"
        })

    # clean up crlf
    script_content = request.POST["script"]
    request.POST["script"] = script_content.replace("\r", "")

    script_form = ScriptForm(request.POST, request.FILES)
    if script_form.is_valid():
        logger.debug("Saving form")
        script_form.save()
        return HttpResponseRedirect('/scripts')
    else:
        context = {'error': "Form isn't valid!"}
        return render(request, 'error.html', context)


def view_script(request, script_id):
    script = get_object_or_404(Script, pk=script_id)
    return render(request, 'scripts/details.html', {'script': script})


def edit_script(request, script_id):
    script = get_object_or_404(Script, pk=script_id)
    script_form = ScriptForm(instance=script)
    context = {'script_form': script_form, 'script': script}
    return render(request, 'scripts/edit.html', context)


def update_script(request):
    required_fields = set(['id', 'name', 'description', 'script'])
    if not required_fields.issubset(request.POST):
        return render(request, 'error.html', {
            'error': "Invalid data in POST"
        })
    try:
        if "id" in request.POST:
            script_id = request.POST['id']
            script = get_object_or_404(Script, pk=script_id)
            script.name = request.POST['name']
            script.description = request.POST['description']
            script.script = request.POST['script'].replace("\r", "")
            script.save()
            return HttpResponseRedirect('/scripts')
        else:
            return render(request, 'error.html', {
                'error': "Invalid data in POST"
            })

    except Exception as e:
        logger.debug(str(e))
        return render(request, 'error.html', {
            'error': 'Could not update script!'
        })


def delete_script(request, script_id):
    script = get_object_or_404(Script, pk=script_id)
    script.delete()
    return HttpResponseRedirect('/scripts')
