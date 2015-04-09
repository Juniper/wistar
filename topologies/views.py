import json

from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse

from topologies.models import Topology
from topologies.models import ConfigSet
from topologies.models import Config
from topologies.forms import ImportForm
import common.lib.wistarUtils as wu
import common.lib.libvirtUtils as lu
import common.lib.junosUtils as ju
from images.models import Image


# FIXME = debug should be a global setting
debug = True


def index(request):
    latest_topo_list = Topology.objects.all().order_by('modified')
    context = {'latest_topo_list': latest_topo_list}
    return render(request, 'topologies/index.html', context)


def edit(request):
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list}
    return render(request, 'topologies/edit.html', context)


def exportTopology(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    jsonData = json.loads(topo.json)
    infoData = {}
    infoData["type"] = "wistar.info"
    infoData["name"] = topo.name
    infoData["description"] = topo.description
    jsonData.append(infoData)
    response = HttpResponse(json.dumps(jsonData), content_type="application/json")
    response['Content-Disposition'] = 'attachment; filename=' + str(topo.name) + '.json'
    return response


@csrf_exempt
def importTopology(request):
    try:
        if request.method == "POST":
            print str(request.FILES)
            form = ImportForm(request.POST, request.FILES)
            jsonFile = request.FILES['file']
            print str(jsonFile)
            jsonString = jsonFile.read()
            jsonData = json.loads(jsonString)
            
            topo = Topology()
            topo.name = "Imported Topology"
            topo.id = 0
           
            for jsonObject in jsonData:
                if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                    ud = jsonObject["userData"]
                    # check if we have this type of image
                    imageList = Image.objects.filter(type = ud["type"])
                    if len(imageList) == 0:
                        # nope, bail out and let the user know what happened!
                        print "Could not find image of type " + ud["type"]
                        return error(request, 'Could not find a valid image of type ' + ud['type'] + '! Please upload an image of this type and try again')

                    image = imageList[0]
                    print str(image.id)
                    jsonObject["userData"]["image"] = image.id
                
                elif jsonObject["type"] == "wistar.info":
                    topo.name = jsonObject["name"]
                    topo.description = jsonObject["description"]

            topo.json = json.dumps(jsonData)

            image_list = Image.objects.all().order_by('name')
            context = {'image_list': image_list, 'topo' : topo}
            return render(request, 'topologies/edit.html', context)

        else:
            form = ImportForm()
            context = {'form': form }
            return render(request, 'topologies/import.html', context)
    except Exception as e:
        print str(e)   
        return error(request, 'Could not parse imported data')


def clone(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    orig_name = topo.name
    topo.name = "Clone of " + orig_name
    topo.json = wu.cloneTopology(topo.json)
    topo.id = 0
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo' : topo}
    return render(request, 'topologies/edit.html', context)


def multiClone(request):
    requiredFields = set([ 'clones', 'topoId' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    topo_id = request.POST["topoId"]
    num_clones = request.POST["clones"]

    topo  = get_object_or_404(Topology, pk=topo_id)
    json = topo.json 
    i = 0
    while i < num_clones: 
        new_topo = topo
        orig_name = topo.name 
        new_topo.name = orig_name
        new_topo.json = wu.cloneTopology(json)
        json = new_topo.json
        new_topo.id = None
        new_topo.save()

    return render(request, 'topologies/edit.html', context)


def detail(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    domain_list = lu.get_domains_for_topology("t" + topo_id)
    network_list = lu.get_networks_for_topology("t" + topo_id)
    configSets = ConfigSet.objects.filter(topology=topo)
    context = {'domain_list': domain_list, 'network_list' : network_list, 'topo_id' : topo_id, 'configSets' : configSets, 'topo' : topo}
    return render(request, 'topologies/edit.html', context)


def delete(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    topo.delete()
    return HttpResponseRedirect('/topologies/')


def error(request, message):
    return render(request, 'topologies/error.html', { 'error_message' : message })


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

    except KeyError:
        return render(request, 'topologies/error.html', { 
            'error_message': "Invalid data in POST"
        })
    else:
        # Always return an HttpResponseRedirect after successfully dealing # with POST data.
        # This prevents data from being posted twice if a
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

    topo = get_object_or_404(Topology, pk=topo_id)
    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topo.json, topo_id)

    topo = get_object_or_404(Topology, pk=topo_id)
    c = ConfigSet(name=name, description=description, topology=topo)
    c.save()

    for device in config["devices"]:
        if device["type"] == "junos_vmx" or device["type"] == "junos_firefly":
            try:
                deviceConfig = ju.get_config(device["ip"], device["password"])

                cfg = Config(ip=device["ip"], name=device["name"], password=device["password"], deviceConfig=deviceConfig, configSet=c)
                cfg.save()

            except Exception as e:
                print "Could not connect to " + device["ip"], e
   
    return HttpResponseRedirect('/topologies/' + topo_id + '/')

