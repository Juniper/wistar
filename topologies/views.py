import json
import logging
import time
import yaml

from django.contrib import messages
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from ajax import views as av
from common.lib import junosUtils
from common.lib import libvirtUtils
from common.lib import osUtils
from common.lib import wistarUtils
from images.models import Image
from scripts.models import Script
from topologies.forms import ImportForm
from topologies.models import Config
from topologies.models import ConfigSet
from topologies.models import Topology
from wistar import configuration

logger = logging.getLogger(__name__)


def index(request):
    logger.debug('---- topology index ----')
    topology_list = Topology.objects.all().order_by('modified')
    context = {'latest_topo_list': topology_list}
    return render(request, 'topologies/index.html', context)


def edit(request):
    logger.debug('---- topology edit ----')
    image_list = Image.objects.all().order_by('name')
    script_list = Script.objects.all().order_by('name')
    context = {'image_list': image_list, 'script_list': script_list,
               'management_subnet': configuration.management_subnet,
               'management_prefix': configuration.management_prefix
               }
    return render(request, 'topologies/edit.html', context)


def new(request):
    logger.debug('---- topology new ----')
    image_list = Image.objects.all().order_by('name')
    script_list = Script.objects.all().order_by('name')
    vm_types = configuration.vm_image_types
    vm_types_string = json.dumps(vm_types)
    image_list_json = serializers.serialize('json', Image.objects.all(), fields=('name', 'type'))

    if configuration.deployment_backend == "openstack":
        external_bridge = configuration.openstack_external_network
    else:
        external_bridge = configuration.kvm_external_bridge

    context = {'image_list': image_list, 'script_list': script_list, 'vm_types': vm_types_string,
               'image_list_json': image_list_json,
               'external_bridge': external_bridge
               }
    return render(request, 'topologies/new.html', context)


def export_topology(request, topo_id):
    logger.debug('---- topology export ----')
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
    logger.debug('---- topology import ----')
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
                    image_list = Image.objects.filter(type=ud["type"])
                    if len(image_list) == 0:
                        # nope, bail out and let the user know what happened!
                        print "Could not find image of type " + ud["type"]
                        return error(request, 'Could not find a valid image of type ' + ud['type'] +
                                     '! Please upload an image of this type and try again')

                    image = image_list[0]
                    print str(image.id)
                    json_object["userData"]["image"] = image.id

                elif json_object["type"] == "wistar.info":
                    topology.name = json_object["name"]
                    topology.description = json_object["description"]

            topology.json = json.dumps(json_data)

            image_list = Image.objects.all().order_by('name')
            script_list = Script.objects.all().order_by('name')
            vm_types = configuration.vm_image_types
            vm_types_string = json.dumps(vm_types)
            context = {'image_list': image_list, 'script_list': script_list, 'vm_types': vm_types_string}
            return render(request, 'topologies/new.html', context)

        else:
            form = ImportForm()
            context = {'form': form}
            return render(request, 'topologies/import.html', context)
    except Exception as e:
        logger.error('Could nt parse imported data')
        logger.error(e)
        return error(request, 'Could not parse imported data')


def clone(request, topo_id):
    logger.debug('---- topology clone ----')
    topology = get_object_or_404(Topology, pk=topo_id)
    orig_name = topology.name
    topology.name = orig_name + " clone"
    topology.json = wistarUtils.clone_topology(topology.json)
    topology.id = 0
    image_list = Image.objects.all().order_by('name')
    script_list = Script.objects.all().order_by('name')
    vm_types = configuration.vm_image_types
    vm_types_string = json.dumps(vm_types)
    context = {'image_list': image_list, 'script_list': script_list, 'topo': topology, 'vm_types': vm_types_string}
    return render(request, 'topologies/new.html', context)


def multi_clone(request):
    logger.debug('---- topology mulit_clone ----')
    required_fields = set(['clones', 'topoId'])
    if not required_fields.issubset(request.POST):
        logger.error('Invalid parameters in POST')
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST["topoId"]
    num_clones = request.POST["clones"]

    topology = get_object_or_404(Topology, pk=topology_id)
    json_string = topology.json
    i = 0
    while i < num_clones:
        new_topo = topology
        orig_name = topology.name
        new_topo.name = orig_name
        new_topo.json = wistarUtils.clone_topology(json_string)
        # json = new_topo.json
        new_topo.id = None
        new_topo.save()

    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def parent(request, domain_name):
    logger.debug('---- topology parent ----')
    topology_id = domain_name.split('_')[0].replace('t', '')
    print "Found topology_id of %s" % topology_id
    return HttpResponseRedirect('/topologies/%s' % topology_id)


def detail(request, topo_id):
    logger.debug('---- topology detail ----')
    print "getting topology %s" % topo_id
    try:
        topology = Topology.objects.get(pk=topo_id)
    except ObjectDoesNotExist:
        logger.error('topology id %s was not found!' % topo_id)
        return render(request, 'error.html', {'error': "Topology not found!"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topo_id)
    network_list = libvirtUtils.get_networks_for_topology("t" + topo_id)
    config_sets = ConfigSet.objects.filter(topology=topology)
    context = {'domain_list': domain_list, 'network_list': network_list, 'topo_id': topo_id,
               'configSets': config_sets, 'topo': topology}
    return render(request, 'topologies/edit.html', context)


def delete(request, topology_id):
    logger.debug('---- topology delete ----')
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

    osUtils.remove_instances_for_topology(topology_prefix)
    osUtils.remove_cloud_init_tmp_dirs(topology_prefix)

    topology.delete()
    messages.info(request, 'Topology %s deleted' % topology.name)
    return HttpResponseRedirect('/topologies/')


def error(request, message):
    logger.debug('---- topology error ----')
    logger.info('error is: %s' % message)
    return render(request, 'error.html', {'error_message': message})


def create(request):
    logger.debug('---- topology create ----')
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
            json_string = request.POST['json']
            description = request.POST['description']
            name = request.POST['name']
            t = Topology(name=name, description=description, json=json_string)
            t.save()
            url += str(t.id)

    except KeyError:
        logger.error('Invalid data in POST')
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
    logger.debug('---- topology create_config_set ----')
    required_fields = set(['name', 'description', 'topoId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST["topoId"]
    name = request.POST["name"]
    description = request.POST["description"]

    topology = get_object_or_404(Topology, pk=topology_id)
    # let's parse the json and convert to simple lists and dicts
    config = wistarUtils.load_config_from_topology_json(topology.json, topology_id)

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
                logger.error('exception: %s' % e)
                print "Could not connect to " + device["ip"], e

    return HttpResponseRedirect('/topologies/' + topology_id + '/')


def launch(request, topology_id):
    logger.debug('---- topology launch ----')
    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist as ex:
        print ex
        return render(request, 'error.html', {'error': "Topology not found!"})

    # let's parse the json and convert to simple lists and dicts
    config = wistarUtils.load_config_from_topology_json(topology.json, topology_id)

    try:
        print "Deploying topology: %s" % topology_id
        # this is a hack - inline deploy should be moved elsewhere
        # but the right structure isn't really there for a middle layer other
        # than utility and view layers ... unless I want to mix utility libs
        av.inline_deploy_topology(config)
    except Exception as e:
        logger.error('exception: %s' % e)
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
    logger.debug('---- topology export heat ----')
    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist:
        logger.error('topology id %s was not found!' % topology_id)
        return render(request, 'error.html', {'error': "Topology not found!"})

    try:
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_config_from_topology_json(topology.json, topology_id)

        heat_template = wistarUtils.get_heat_json_from_topology_config(config)
        heat_template_object = json.loads(heat_template)
        heat_template_yaml = yaml.safe_dump(heat_template_object)
        return HttpResponse(heat_template_yaml, content_type="text/plain")
    except Exception as e:
        print "Caught Exception in deploy heat"
        logger.error('exception: %s' % e)
        return render(request, 'error.html', {'error': str(e)})
