from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect, HttpResponse
from django.conf import settings
from topologies.models import Topology
from topologies.models import ConfigSet
from topologies.models import Config
from common.lib.wistarException import wistarException
import common.lib.wistarUtils as wu
import common.lib.libvirtUtils as lu
import common.lib.consoleUtils as cu
import common.lib.osUtils as ou
import common.lib.junosUtils as ju
import common.lib.vboxUtils as vu
from images.models import Image
import logging
import time
import json

# FIXME = debug should be a global setting
debug = True

def index(request):
    latest_topo_list = Topology.objects.all().order_by('modified')
    context = {'latest_topo_list': latest_topo_list}
    return render(request, 'index.html', context)

def edit(request):
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list}
    return render(request, 'edit.html', context)

def exportTopology(request, topo_id):
    response_data = {}
    response_data["result"] = True
    return HttpResponse(json.dumps(response_data), content_type="application/json")

def importTopology(request):
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list}
    return render(request, 'import.html', context)

def clone(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    orig_name = topo.name
    topo.name = "Clone of " + orig_name
    topo.id = 0
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo' : topo}
    return render(request, 'edit.html', context)

def detail(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    domain_list = lu.getDomainsForTopology("t" + topo_id)
    network_list = lu.getNetworksForTopology("t" + topo_id)
    configSets = ConfigSet.objects.filter(topology=topo)
    context = {'domain_list': domain_list, 'network_list' : network_list, 'topo_id' : topo_id, 'configSets' : configSets, 'topo' : topo}
    return render(request, 'edit.html', context)

def delete(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    topo.delete()
    return HttpResponseRedirect('/topologies/')

def error(request):
    return render(request, 'error.html')

def create(request):
    try:
        if request.POST.has_key('id'):
            topo_id = request.POST['id']
            topo = get_object_or_404(Topology, pk=topo_id)
            topo.json = request.POST['json']
            topo.name = request.POST['name']
            topo.description = request.POST['description']
            topo.save()
        else:
            json = request.POST['json']
            description = request.POST['description']
            name = request.POST['name']
            t = Topology(name=name, description=description, json=json)
            t.save()

    except (KeyError):
        return render(request, 'topologies/error.html', { 
            'error_message': "error"
    })
    else:
        # Always return an HttpResponseRedirect after successfully dealing # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        # return HttpResponseRedirect(reverse('topologies:converted', args=(p.id,)))
        # context = { 'json': json, 'name' : name, 'description' : description }
        # return render(request, 'topologies/output.html', context)
        return HttpResponseRedirect('/topologies/')


def createConfigSet(request):
    requiredFields = set([ 'name', 'description', 'topoId' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    topo_id = request.POST["topoId"]
    name = request.POST["name"]
    description = request.POST["description"]

    topo  = get_object_or_404(Topology, pk=topo_id)
    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topo.json, topo_id)

    topo = get_object_or_404(Topology, pk=topo_id)
    c = ConfigSet(name=name, description=description, topology=topo)
    c.save()

    for device in config["devices"]:
        if device["type"] == "junos_vmx" or device["type"] == "junos_firefly":
            try:
                deviceConfig = ju.getConfig(device["ip"], device["password"])

                cfg = Config(ip=device["ip"], name=device["name"], password=device["password"], deviceConfig=deviceConfig, configSet=c)
                cfg.save()

            except Exception as e:
                print "Could not connect to " + device["ip"], e
   
    return HttpResponseRedirect('/topologies/' + topo_id + '/')

