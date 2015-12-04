import json

from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import messages
from django.template.loader import render_to_string

from topologies.models import Topology
from topologies.models import ConfigSet
from topologies.models import Config
from topologies.forms import ImportForm
from common.lib import wistarUtils
from common.lib import libvirtUtils
from common.lib import junosUtils
from common.lib import osUtils
from images.models import Image
from scripts.models import Script
import time
# mild hack alert
from ajax import views as av


# FIXME = debug should be a global setting
debug = True


def index(request):
    topology_list = Topology.objects.all().order_by('modified')
    context = {'latest_topo_list': topology_list}
    return render(request, 'topologies/index.html', context)


def edit(request):
    image_list = Image.objects.all().order_by('name')
    script_list = Script.objects.all().order_by('name')
    context = {'image_list': image_list, 'script_list': script_list}
    return render(request, 'topologies/edit.html', context)


def new(request):
    image_list = Image.objects.all().order_by('name')
    script_list = Script.objects.all().order_by('name')
    context = {'image_list': image_list, 'script_list': script_list}
    return render(request, 'topologies/new.html', context)


def export_topology(request, topo_id):
    topology = get_object_or_404(Topology, pk=topo_id)
    json_data = json.loads(topology.json)
    info_data = dict()
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
           
            for json_object in json_data:
                if "userData" in json_object and "wistarVm" in json_object["userData"]:
                    ud = json_object["userData"]
                    # check if we have this type of image
                    image_list = Image.objects.filter(type = ud["type"])
                    if len(image_list) == 0:
                        # nope, bail out and let the user know what happened!
                        print "Could not find image of type " + ud["type"]
                        return error(request, 'Could not find a valid image of type ' + ud['type'] 
                                     + '! Please upload an image of this type and try again')

                    image = image_list[0]
                    print str(image.id)
                    json_object["userData"]["image"] = image.id
                
                elif json_object["type"] == "wistar.info":
                    topology.name = json_object["name"]
                    topology.description = json_object["description"]

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
    topology.json = wistarUtils.clone_topology(topology.json)
    topology.id = 0
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def multi_clone(request):
    required_fields = set(['clones', 'topoId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST["topoId"]
    num_clones = request.POST["clones"]

    topology = get_object_or_404(Topology, pk=topology_id)
    json = topology.json
    i = 0
    while i < num_clones: 
        new_topo = topology
        orig_name = topology.name
        new_topo.name = orig_name
        new_topo.json = wistarUtils.clone_topology(json)
        json = new_topo.json
        new_topo.id = None
        new_topo.save()

    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def parent(request, domain_name):
    topology_id = domain_name.split('_')[0].replace('t', '')
    print "Found topology_id of %s" % topology_id
    return HttpResponseRedirect('/topologies/%s' % topology_id)


def detail(request, topo_id):
    print "getting topology %s" % topo_id
    try:
        topology = Topology.objects.get(pk=topo_id)
    except ObjectDoesNotExist:
        print "not found!"
        return render(request, 'error.html', {'error': "Topology not found!"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topo_id)
    network_list = libvirtUtils.get_networks_for_topology("t" + topo_id)
    config_sets = ConfigSet.objects.filter(topology=topology)
    context = {'domain_list': domain_list, 'network_list': network_list, 'topo_id': topo_id,
               'configSets': config_sets, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def delete(request, topology_id):

    topology_prefix = "t%s_" % topology_id
    network_list = libvirtUtils.get_networks_for_topology(topology_prefix)
    for network in network_list:
        print "undefine network: " + network["name"]
        libvirtUtils.undefine_network(network["name"])

    domain_list = libvirtUtils.get_domains_for_topology(topology_prefix)
    for domain in domain_list:
        print "undefine domain: " + domain["name"]
        source_file = libvirtUtils.get_image_for_domain(domain["uuid"])
        if libvirtUtils.undefine_domain(domain["uuid"]):
            if source_file is not None:
                osUtils.remove_instance(source_file)

    topology = get_object_or_404(Topology, pk=topology_id)
    topology.delete()
    osUtils.remove_cloud_init_tmp_dirs(topology_prefix)

    messages.info(request, 'Topology %s deleted' % topology.name)
    return HttpResponseRedirect('/topologies/')


def error(request, message):
    return render(request, 'error.html', {'error_message': message})


def create(request):
    url = '/topologies/'
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
            url += str(t.id)

    except KeyError:
        return render(request, 'error.html', { 
            'error_message': "Invalid data in POST"
        })
    else:
        # Always return an HttpResponseRedirect after successfully dealing # with POST data.
        # This prevents data from being posted twice if a
        # user hits the Back button.
        # return HttpResponseRedirect(reverse('topologies:converted', args=(p.id,)))
        # context = { 'json': json, 'name': name, 'description': description }
        # return render(request, 'topologies/output.html', context)
        return HttpResponseRedirect(url)


def create_config_set(request):
    required_fields = set(['name', 'description', 'topoId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST["topoId"]
    name = request.POST["name"]
    description = request.POST["description"]

    topology = get_object_or_404(Topology, pk=topology_id)
    # let's parse the json and convert to simple lists and dicts
    config = wistarUtils.load_json(topology.json, topology_id)

    c = ConfigSet(name=name, description=description, topology=topology)
    c.save()

    for device in config["devices"]:
        if device["type"] == "junos_vmx" or device["type"] == "junos_firefly":
            try:
                device_config = junosUtils.get_config(device["ip"], device["password"])

                cfg = Config(ip=device["ip"], name=device["name"], password=device["password"],
                             deviceConfig=device_config, configSet=c)
                cfg.save()

            except Exception as e:
                print "Could not connect to " + device["ip"], e
   
    return HttpResponseRedirect('/topologies/' + topology_id + '/')


def launch(request, topology_id):
    topology = dict()
    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist as ex:
        print ex
        return render(request, 'error.html', {'error': "Topology not found!"})

    # let's parse the json and convert to simple lists and dicts
    config = wistarUtils.load_json(topology.json, topology_id)

    try:
        print "Deploying topology: %s" % topology_id
        # this is a hack - inline deploy should be moved elsewhere
        # but the right structure isn't really there for a middle layer other
        # than utility and view layers ... unless I want to mix utility libs
        av.inline_deploy_topology(config)
    except Exception as e:
        return render(request, 'error.html', {'error': str(e)})

    domain_list = libvirtUtils.get_domains_for_topology("t%s_" % topology_id)
    network_list = []

    if osUtils.check_is_linux():
        network_list = libvirtUtils.get_networks_for_topology("t%s_" % topology_id)

    for network in network_list:
        print "Starting network: " + network["name"]
        if libvirtUtils.start_network(network["name"]):
            time.sleep(1)
        else:
            return render(request, 'error.html', {'error': "Could not start network: " + network["name"]})

    num_domains = len(domain_list)
    iter_counter = 1
    for domain in domain_list:
        print "Starting domain " + domain["name"]
        if libvirtUtils.start_domain(domain["uuid"]):
            if iter_counter < num_domains:
                time.sleep(1)
            iter_counter += 1
        else:
            return render(request, 'error.html', {'error': "Could not start domain: " + domain["name"]})

    print "All domains started"
    messages.info(request, 'Topology %s launched successfully' % topology.name)

    return HttpResponseRedirect('/topologies/')


@csrf_exempt
def export_as_heat_template(request, topology_id):
    """
    :param request: Django request
    :param topology_id: id of the topology to export
    :return: renders the heat template
    """
    topology = dict()
    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist:
        return render(request, 'error.html', {'error': "Topology not found!"})

    try:
        # keep a quick local cache around of found image_name to image_id pairs
        image_names = dict()

        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_json(topology.json, topology_id)

        for device in config["devices"]:
            image_id = device["imageId"]
            # have we already looked up this image_id ?
            if image_id in image_names:
                name = image_names[image_id]
            else:
                # nope, cache it and return it
                image = Image.objects.get(pk=device["imageId"])
                name = image.name
                image_names[image_id] = name

            device["imageName"] = name
            # FIXME - add code to set the flavor here based on CPU and RAM
            device["flavor"] = "m1.medium"

        heat_template = render_to_string("contrail_heat_template", {'config': config})
        return HttpResponse(heat_template, content_type="text/plain")
    except Exception as e:
        print "Caught Exception in deploy"
        print str(e)
        return render(request, 'error.html', {'error': str(e)})
