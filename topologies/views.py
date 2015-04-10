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
    topology_list = Topology.objects.all().order_by('modified')
    context = {'latest_topo_list': topology_list}
    return render(request, 'topologies/index.html', context)


def edit(request):
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list}
    return render(request, 'topologies/edit.html', context)


def export_topology(request, topo_id):
    topology  = get_object_or_404(Topology, pk=topo_id)
    json_data = json.loads(topology.json)
    info_data = {}
    info_data["type"] = "wistar.info"
    info_data["name"] = topology.name
    info_data["description"] = topology.description
    json_data.append(info_data)
    response = HttpResponse(json.dumps(json_data), content_type="application/json")
    response['Content-Disposition'] = 'attachment; filename=' + str(topology.name) + '.json'
    return response


@csrf_exempt
def import_topology(request):
    try:
        if request.method == "POST":
            print str(request.FILES)
            
            json_file = request.FILES['file']
            print str(json_file)
            json_string = json_file.read()
            json_data = json.loads(json_string)
            
            topology = Topology()
            topology.name = "Imported Topology"
            topology.id = 0
           
            for jsonObject in json_data:
                if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                    ud = jsonObject["userData"]
                    # check if we have this type of image
                    image_list = Image.objects.filter(type = ud["type"])
                    if len(image_list) == 0:
                        # nope, bail out and let the user know what happened!
                        print "Could not find image of type " + ud["type"]
                        return error(request, 'Could not find a valid image of type ' + ud['type'] 
                                     + '! Please upload an image of this type and try again')

                    image = image_list[0]
                    print str(image.id)
                    jsonObject["userData"]["image"] = image.id
                
                elif jsonObject["type"] == "wistar.info":
                    topology.name = jsonObject["name"]
                    topology.description = jsonObject["description"]

            topology.json = json.dumps(json_data)

            image_list = Image.objects.all().order_by('name')
            context = {'image_list': image_list, 'topo': topology}
            return render(request, 'topologies/edit.html', context)

        else:
            form = ImportForm()
            context = {'form': form }
            return render(request, 'topologies/import.html', context)
    except Exception as e:
        print str(e)   
        return error(request, 'Could not parse imported data')


def clone(request, topo_id):
    topology = get_object_or_404(Topology, pk=topo_id)
    orig_name = topology.name
    topology.name = "Clone of " + orig_name
    topology.json = wu.cloneTopology(topology.json)
    topology.id = 0
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def multi_clone(request):
    required_fields = set(['clones', 'topoId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

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
    topology = get_object_or_404(Topology, pk=topo_id)
    domain_list = lu.get_domains_for_topology("t" + topo_id)
    network_list = lu.get_networks_for_topology("t" + topo_id)
    config_sets = ConfigSet.objects.filter(topology=topology)
    context = {'domain_list': domain_list, 'network_list': network_list, 'topo_id': topo_id,
               'configSets': config_sets, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def delete(request, topo_id):
    topology = get_object_or_404(Topology, pk=topo_id)
    topology.delete()
    return HttpResponseRedirect('/topologies/')


def error(request, message):
    return render(request, 'topologies/error.html', {'error_message': message})


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
        # context = { 'json': json, 'name': name, 'description': description }
        # return render(request, 'topologies/output.html', context)
        return HttpResponseRedirect('/topologies/')


def create_config_set(request):
    required_fields = {'name', 'description', 'topoId'}
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST["topoId"]
    name = request.POST["name"]
    description = request.POST["description"]

    topology = get_object_or_404(Topology, pk=topology_id)
    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topology.json, topology_id)

    c = ConfigSet(name=name, description=description, topology=topology)
    c.save()

    for device in config["devices"]:
        if device["type"] == "junos_vmx" or device["type"] == "junos_firefly":
            try:
                device_config = ju.get_config(device["ip"], device["password"])

                cfg = Config(ip=device["ip"], name=device["name"], password=device["password"],
                             deviceConfig=device_config, configSet=c)
                cfg.save()

            except Exception as e:
                print "Could not connect to " + device["ip"], e
   
    return HttpResponseRedirect('/topologies/' + topology_id + '/')

