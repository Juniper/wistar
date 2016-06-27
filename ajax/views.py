import os
import time
import json
import random

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.template.loader import render_to_string
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from common.lib.WistarException import WistarException
from common.lib import wistarUtils
from common.lib import libvirtUtils
from common.lib import junosUtils
from common.lib import linuxUtils
from common.lib import consoleUtils
from common.lib import osUtils
from common.lib import vboxUtils
from common.lib import openstackUtils
from api.lib import apiUtils
from images.models import Image
from scripts.models import ConfigTemplate
from scripts.models import Script
from topologies.models import Topology
from topologies.models import ConfigSet
from topologies.models import Config

from wistar import configuration


# FIXME = debug should be a global setting
debug = True


def index(request):
    return HttpResponseRedirect('/topologies/')


def manage_hypervisor(request):
    return render(request, 'ajax/manageHypervisor.html')


def view_domain(request, domain_id):
    try:
        domain = libvirtUtils.get_domain_by_uuid(domain_id)
        return render(request, 'ajax/viewDomain.html', {'domain': domain, 'xml': domain.XMLDesc(0)})
    except Exception as e:
        return render(request, 'ajax/ajaxError.html', {'error': e})


def view_network(request, network_name):
    try:
        network = libvirtUtils.get_network_by_name(network_name)
        return render(request, 'ajax/viewNetwork.html', {'network': network, 'xml': network.XMLDesc(0)})
    except Exception as e:
        return render(request, 'ajax/ajaxError.html', {'error': e})


@csrf_exempt
def preconfig_junos_domain(request):
    response_data = {"result": True}
    required_fields = set(['domain', 'password', 'ip', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    password = request.POST['password']
    ip = request.POST['ip']
    mgmt_interface = request.POST['mgmtInterface']
    
    print "Configuring domain:" + str(domain)
    try:

        # let's see if we need to kill any webConsole sessions first
        wc_dict = request.session.get("webConsoleDict")
        if wc_dict is not None:
            if wc_dict.has_key(domain):
                wc_config = wc_dict[domain]
                wc_port = wc_config["wsPort"]
                server = request.get_host().split(":")[0]
                wistarUtils.kill_web_socket(server, wc_port)

        # FIXME - there is a bug somewhere that this can be blank ?
        if mgmt_interface == "":
            mgmt_interface = "em0"
        elif mgmt_interface == "em0":
            if not osUtils.check_is_linux():
                mgmt_interface = "fxp0"
        
        response_data["result"] = consoleUtils.preconfig_junos_domain(domain, password, ip, mgmt_interface)
        print str(response_data)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def preconfig_linux_domain(request):
    response_data = {"result": True}
    required_fields = set(['domain', 'hostname', 'password', 'ip', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    password = request.POST['password']
    ip = request.POST['ip']
    mgmt_interface = request.POST['mgmtInterface']
    hostname = request.POST['hostname']

    print "Configuring linux domain:" + str(domain)
    try:
        response_data["result"] = consoleUtils.preconfig_linux_domain(domain, hostname, password, ip, mgmt_interface)
        print str(response_data)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def preconfig_firefly(request):
    response_data = {"result": True}
    required_fields = set(['domain', 'password', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    password = request.POST['password']
    mgmt_interface = request.POST['mgmtInterface']
    ip = request.POST['ip']
    
    try:
        # let's see if we need to kill any webConsole sessions first
        wc_dict = request.session.get("webConsoleDict")
        if wc_dict is not None:
            if wc_dict.has_key(domain):
                wc_config = wc_dict[domain]
                wc_port = wc_config["wsPort"]
                server = request.get_host().split(":")[0]
                wistarUtils.kill_web_socket(server, wc_port)

        print "Configuring management Access"
        if consoleUtils.preconfig_junos_domain(domain, password, ip, mgmt_interface):
            print "Configuring Firefly management zones:" + str(domain)
            time.sleep(3)
            response_data["result"] = consoleUtils.preconfig_firefly(domain, password, mgmt_interface)
        else:
            response_data["result"] = False
            response_data["message"] = "Could not configure Firefly access"

        return HttpResponse(json.dumps(response_data), content_type="application/json")

    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def config_junos_interfaces(request):
    response_data = {"result": True}
    required_fields = set(['password', 'ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    password = request.POST['password']
    print "Configuring interfaces for " + str(ip)
    try:
        response_data["result"] = junosUtils.config_junos_interfaces(ip, password)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def execute_cli(request):
    response_data = {"result": True}
    required_fields = set(['ip', 'pw', 'cli'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    pw = request.POST['pw']
    cli = request.POST['cli']

    result = junosUtils.execute_cli(ip, pw, cli)
    if result is None:
        response_data["result"] = False
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else: 

        response_data["output"] = result 
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def execute_linux_cli(request):
    response_data = {"result": True}
    required_fields = set(['ip', 'pw', 'cli'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    pw = request.POST['pw']
    cli = request.POST['cli']

    result = linuxUtils.execute_cli(ip, "root", pw, cli)
    if result is None:
        response_data["result"] = False
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else: 

        response_data["output"] = result 
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_junos_startup_state(request):
    response_data = dict()
    response_data["console"] = False
    response_data["power"] = False

    required_fields = set(['name'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    name = request.POST['name']
    if libvirtUtils.is_domain_running(name):
        # topologies/edit will fire multiple calls at once
        # let's just put a bit of a breather between each one
        time.sleep(random.randint(0, 10) * .10)
        response_data["power"] = True
        response_data["console"] = consoleUtils.is_junos_device_at_prompt(name)

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_linux_startup_state(request):
    response_data = dict()
    response_data["console"] = False
    response_data["power"] = False

    required_fields = set(['name'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    name = request.POST['name']
    if libvirtUtils.is_domain_running(name):
        time.sleep(random.randint(0, 10) * .10)
        response_data["power"] = True
        response_data["console"] = consoleUtils.is_linux_device_at_prompt(name)

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_junos_config(request):
    response_data = {"result": True}
    required_fields = set(['ip', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    password = request.POST['password']
    print "Getting Config for " + str(ip)
    try:
        xml = junosUtils.get_config(ip, password)
        print xml

        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_config_templates(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    template_list = ConfigTemplate.objects.all().order_by('modified')
    
    ip = request.POST['ip']
    context = {'template_list': template_list, 'ip': ip}
    return render(request, 'ajax/configTemplates.html', context)


@csrf_exempt
def get_scripts(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    script_list = Script.objects.all().order_by('modified')

    ip = request.POST['ip']
    context = {'script_list': script_list, 'ip': ip}
    return render(request, 'ajax/scripts.html', context)


@csrf_exempt
def push_script(request):
    required_fields = set(['script_id', 'username', 'password', 'ip'])
    if not required_fields.issubset(request.POST):
        context = {'output': "Invalid parameters in POST"}
        return render(request, 'ajax/scriptOutput.html', context)

    script_id = request.POST["script_id"]
    username = request.POST["username"]
    password = request.POST["password"]
    ip = request.POST["ip"]

    script = Script.objects.get(pk=script_id)

    print "Executing script " + script.name

    try:
        linuxUtils.push_remote_script(ip, username, password, script.script, script.destination)
        output = linuxUtils.execute_cli(ip, username, password, script.destination)

        context = {'output': output}
        return render(request, 'ajax/scriptOutput.html', context)

    except WistarException as we:
        context = {'output': str(we)}
        return render(request, 'ajax/scriptOutput.html', context)


@csrf_exempt
def sync_link_data(request):
    response_data = {"result": True}
    required_fields = set(['sourceIp', 'sourceType', 'targetIp', 'targetType', 'sourcePortIp', 'targetPortIp',
                       'sourceIface', 'targetIface', 'sourcePw', 'targetPw', 'json', 'topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})
    
    source_ip = request.POST['sourceIp']
    source_type = request.POST['sourceType']
    target_ip = request.POST['targetIp']
    target_type = request.POST['targetType']
    source_port_ip = request.POST['sourcePortIp']
    target_port_ip = request.POST['targetPortIp']
    source_interface = request.POST['sourceIface']
    target_interface = request.POST['targetIface']
    source_pw = request.POST['sourcePw']
    target_pw = request.POST['targetPw']
    json_data = request.POST['json']
    topology_id = request.POST['topologyId']

    try:
        if source_ip != "0.0.0.0":
            print "Configuring interfaces for " + str(source_ip)
            if source_type == "linux":
                source_results = linuxUtils.set_interface_ip_address(source_ip, "root", source_pw, source_interface, source_port_ip)
            else:
                source_results = junosUtils.set_interface_ip_address(source_ip, source_pw, source_interface, source_port_ip)

            if source_results is False:
                raise WistarException("Couldn't set ip address on source VM")
        
        if target_ip != "0.0.0.0":
            if target_type == "linux":
                target_results = linuxUtils.set_interface_ip_address(target_ip, "root", target_pw, target_interface, target_port_ip)
            else:
                target_results = junosUtils.set_interface_ip_address(target_ip, target_pw, target_interface, target_port_ip)

            if target_results is False:
                raise WistarException("Couldn't set ip address on target VM")

        print "saving sync data on topology json as well"
        topology = Topology.objects.get(pk=topology_id)
        topology.json = json_data
        topology.save()

        response_data["result"] = "Success"
        print str(response_data)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def start_topology(request):
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})
    
    topology_id = request.POST['topologyId']

    if topology_id == "":
        print "Found a blank topoId!"
        return render(request, 'ajax/ajaxError.html', {'error': "Blank Topology Id found"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")
    network_list = []

    if configuration.deployment_backend == "kvm":
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")

    for network in network_list:
        print "Starting network: " + network["name"]
        if libvirtUtils.start_network(network["name"]):
            time.sleep(1)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start network: " + network["name"]})

    num_domains = len(domain_list)
    iter_counter = 1
    for domain in domain_list:
        print "Starting domain " + domain["name"]
        if libvirtUtils.start_domain(domain["uuid"]):
            if iter_counter < num_domains:
                time.sleep(180)
            iter_counter += 1
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start domain: " + domain["name"]})

    print "All domains started"
    return refresh_deployment_status(request)


@csrf_exempt
def pause_topology(request):
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST['topologyId']

    if topology_id == "":
        print "Found a blank topoId!"
        return render(request, 'ajax/ajaxError.html', {'error': "Blank Topology Id found"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")

    for domain in domain_list:
        if domain["state"] == "running":
            print "Pausing domain " + domain["name"]
            libvirtUtils.suspend_domain(domain["uuid"])
            time.sleep(5)
        else:
            print "Domain %s is already shut down" % domain["name"]

    network_list = []
    if osUtils.check_is_linux():
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")

    for network in network_list:
        print "Stopping network: " + network["name"]
        if libvirtUtils.stop_network(network["name"]):
            time.sleep(1)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop network: " + network["name"]})

    print "All domains paused"
    return refresh_deployment_status(request)


@csrf_exempt
def refresh_deployment_status(request):
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})
    
    topology_id = request.POST['topologyId']

    if topology_id == "":
        print "Found a blank topology_id, returning full hypervisor status"
        return refresh_hypervisor_status(request)

    if configuration.deployment_backend == "openstack":
        refresh_openstack_deployment_status(request, topology_id)
    else:
        domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")
        network_list = []
        is_linux = False
        if osUtils.check_is_linux():
            is_linux = True
            network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")

        context = {'domain_list': domain_list, 'network_list': network_list, 'topologyId': topology_id,
                   'isLinux': is_linux}
        return render(request, 'ajax/deploymentStatus.html', context)


def refresh_openstack_deployment_status(request, topology_id):
    if openstackUtils.connect_to_openstack():
        topology = Topology.objects.get(pk=topology_id)
        stack_name = topology.name.replace(' ', '_')
        stack_details = openstackUtils.get_stack_details(stack_name)
        stack_resources = dict()
        print stack_details
        if stack_details is not None and stack_details["stack_status"] == "CREATE_COMPLETE":
            stack_resources = openstackUtils.get_stack_resources(stack_name, stack_details["id"])

    context = {"stack": stack_details, "topology_id": topology.id,
               "openstack_host": configuration.openstack_host,
               "stack_resources": stack_resources
               }
    return render(request, 'ajax/openstackDeploymentStatus.html', context)


@csrf_exempt
def refresh_host_load(request):
    (one, five, ten) = os.getloadavg()
    load = {'one': one, 'five': five, 'ten': ten}
    context = {'load': load}
    return render(request, 'ajax/hostLoad.html', context)


@csrf_exempt
def refresh_hypervisor_status(request):
    try:
        domains = libvirtUtils.list_domains()
        if osUtils.check_is_linux():
            networks = libvirtUtils.list_networks()
        else:
            networks = []

        context = {'domain_list': domains, 'network_list': networks}
        return render(request, 'ajax/deploymentStatus.html', context)

    except Exception as e:
        return render(request, 'ajax/ajaxError.html', {'error': e})


@csrf_exempt
def check_ip(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip_address = request.POST['ip']
    ip_exists = osUtils.check_ip(ip_address)
    response_data = {"result": ip_exists}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_available_ip(request):
    # just grab the next available IP
    print "getting IPS"
    all_used_ips = apiUtils.get_used_ips()
    print all_used_ips
    next_ip = apiUtils.get_next_ip(all_used_ips, 2)
    print next_ip
    response_data = {"result": next_ip}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def manage_domain(request):

    required_fields = set(['domainId', 'action', 'topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain_id = request.POST['domainId']
    action = request.POST['action']
    topology_id = request.POST["topologyId"]

    if action == "start":
        # force all networks to be up before we start a topology
        # potential minor optimization here to only start networks attached to domain
        networks = libvirtUtils.get_networks_for_topology(topology_id)
        for network in networks:
            if network["state"] != "running":
                libvirtUtils.start_network(network["name"])

        # prevent start up errors by missing ISO files - i.e cloud-init seed files
        domain = libvirtUtils.get_domain_by_uuid(domain_id)
        iso = libvirtUtils.get_iso_for_domain(domain.name())
        # if we have an ISO file configured, and it doesn't actually exist
        # just remove it completely
        if iso is not None and not osUtils.check_path(iso):
            print "Removing non-existent ISO from domain"
            libvirtUtils.detach_iso_from_domain(domain.name())

        # now we should be able to safely start the domain
        if libvirtUtils.start_domain(domain_id):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start domain!"})

    elif action == "stop":
        if libvirtUtils.stop_domain(domain_id):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop domain!"})
    
    elif action == "suspend":
        if libvirtUtils.suspend_domain(domain_id):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not suspend domain!"})

    elif action == "undefine":
        source_file = libvirtUtils.get_image_for_domain(domain_id)
        if libvirtUtils.undefine_domain(domain_id):
            if source_file is not None:
                osUtils.remove_instance(source_file)
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop domain!"})
    else:
            return render(request, 'ajax/ajaxError.html', {'error': "Unknown Parameters in POST!"})


@csrf_exempt
def manage_network(request):

    required_fields = set(['networkName', 'action', 'topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    network_name = request.POST['networkName']
    action = request.POST['action']

    if action == "start": 
        if libvirtUtils.start_network(network_name):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start network!"})
    elif action == "stop":
        if libvirtUtils.stop_network(network_name):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop network!"})

    elif action == "undefine":
        if libvirtUtils.undefine_network(network_name):
            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop domain!"})
    else:
            return render(request, 'ajax/ajaxError.html', {'error': "Unknown Parameters in POST!"})


@csrf_exempt
def apply_config_template(request):
    print "Pushing Config Template"
    response_data = {"result": True, "message": "Applied configuration successfully"}

    required_fields = set(['id', 'ip', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_template_id = request.POST['id'] 
    ip = request.POST['ip'] 
    password = request.POST['password']

    config_template = ConfigTemplate.objects.get(pk=config_template_id)
    template = config_template.template
    cleaned_template = template.replace('\r\n', '\n')
    print cleaned_template
    if junosUtils.push_config(cleaned_template, ip, password):
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Could not apply config template"
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def apply_junos_set_config(request):
    print "Pushing Set Config"
    response_data = {"result": True, "message": "Applied configuration successfully"}

    required_fields = set(['config', 'ip', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config = request.POST['config']
    ip = request.POST['ip']
    password = request.POST['password']

    print config
    if junosUtils.push_config(config, ip, password):
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Could not apply config template"
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def push_config_set(request):
    print "Pushing ConfigSet"
    response_data = {"result": True}

    required_fields = set(['id'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_set_id = request.POST['id']

    print "csid is " + config_set_id

    cs = ConfigSet.objects.get(pk=config_set_id)

    configs = Config.objects.filter(configSet=cs)

    for config in configs:
        print config.ip
        try:
            junosUtils.push_config_string(config.deviceConfig, config.ip, config.password)
        except Exception as e:
            print "Could not reload config on " + str(config.ip)
            response_data["message"] = response_data["message"] + " Error pushing to " + str(config.ip)
            print e

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def delete_config_set(request):
    print "Deleting ConfigSet"
    response_data = {"result": True}

    required_fields = set(['id'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_set_id = request.POST['id']
    cs = ConfigSet.objects.get(pk=config_set_id)
    cs.delete()
    
    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def multi_clone_topology(request):
    response_data = {"result": True}
    required_fields = set(['clones', 'topologyId'])
    if not required_fields.issubset(request.POST):

        response_data["message"] = "Invalid Parameters in Post"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    topology_id = request.POST["topologyId"]
    num_clones = request.POST["clones"]

    print num_clones

    topology = Topology.objects.get(pk=topology_id)
    orig_name = topology.name
    json_data = topology.json
    i = 0
    while i < int(num_clones):
        new_topology = topology
        new_topology.name = orig_name + " " + str(i + 1).zfill(2)
        new_topology.json = wistarUtils.clone_topology(json_data)
        json_data = new_topology.json
        new_topology.id = None
        new_topology.save()
        i += 1

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def deploy_topology(request):

    if 'topologyId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})
    
    topology_id = request.POST['topologyId']
    try:
        topo = Topology.objects.get(pk=topology_id)
    except Exception as ex:
        print ex
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})

    try:
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_json(topo.json, topology_id)
        # FIXME - should this be pushed into another module?
        inline_deploy_topology(config)
    except Exception as e:
        print "Caught Exception in deploy"
        print str(e)
        return render(request, 'ajax/ajaxError.html', {'error': str(e)})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")
    network_list = []
        
    if osUtils.check_is_linux():
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")
    context = {'domain_list': domain_list, 'network_list': network_list, 'isLinux': True, 'topologyId': topology_id}
    return render(request, 'ajax/deploymentStatus.html', context)


@csrf_exempt
def inline_deploy_topology(config):
    # only create networks on Linux/KVM
    print "Checking if we should create networks first!"
    if osUtils.check_is_linux():
        for network in config["networks"]:
            try:
                if not libvirtUtils.network_exists(network["name"]):
                    if debug:
                        print "Rendering networkXml for: " + network["name"]
                    network_xml = render_to_string("ajax/kvm/network.xml", {'network': network})
                    print network_xml
                    libvirtUtils.define_network_from_xml(network_xml)
                    time.sleep(.5)

                print "Starting network"
                libvirtUtils.start_network(network["name"])
            except Exception as e:
                raise Exception(str(e))

    # are we on linux? are we on Ubuntu linux? set kvm emulator accordingly
    vm_env = dict()
    vm_env["emulator"] = "/usr/libexec/qemu-kvm"
    vm_env["pcType"] = "rhel6.5.0"
    # possible values for 'cache' are 'none' (default) and 'writethrough'. Use writethrough if you want to
    # mount the instances directory on a glusterFs or tmpfs volume. This might make sense if you have tons of RAM
    # and want to alleviate IO issues. If in doubt, leave it as 'none'
    vm_env["cache"] = "none"
    if osUtils.check_is_linux() and osUtils.check_is_ubuntu():
        vm_env["emulator"] = "/usr/bin/kvm-spice"
        vm_env["pcType"] = "pc"

    # by default, we use kvm as the hypervisor
    domain_xml_path = "ajax/kvm/"
    if not osUtils.check_is_linux():
        # if we're not on Linux, then let's try to use vbox instead
        domain_xml_path = "ajax/vbox/"

    for device in config["devices"]:
        try:
            if not libvirtUtils.domain_exists(device["name"]):
                if debug:
                    print "Rendering deviceXml for: " + device["name"]

                configuration_file = device["configurationFile"]
                print "using config file: " + configuration_file

                print device

                image = Image.objects.get(pk=device["imageId"])
                image_base_path = settings.MEDIA_ROOT + "/" + image.filePath.url
                instance_path = osUtils.get_instance_path_from_image(image_base_path, device["name"])

                if not osUtils.check_path(instance_path):
                    if not osUtils.create_thin_provision_instance(image_base_path, device["name"]):
                        raise Exception("Could not create image instance for image: " + image_base_path)

                if "secondaryDisk" in device:
                    print "Creating secondary Disk information"
                    secondary_image = Image.objects.get(pk=device["secondaryDisk"])
                    secondary_base_path = settings.MEDIA_ROOT + "/" + secondary_image.filePath.url
                    secondary_instance_path = osUtils.get_instance_path_from_image(secondary_base_path,
                                                                                   device["name"] + "_secondary"
                                                                                   )

                    if not osUtils.check_path(secondary_instance_path):
                        if not osUtils.create_thin_provision_instance(secondary_base_path, 
                                                                      device["name"] + "_secondary"
                                                                      ):
                            raise Exception("Could not create image instance for image: " + secondary_base_path)

                    device["secondaryDiskPath"] = secondary_instance_path

                if "tertiaryDisk" in device:
                    print "Creating tertiary Disk information"
                    tertiary_image = Image.objects.get(pk=device["tertiaryDisk"])
                    tertiary_base_path = settings.MEDIA_ROOT + "/" + tertiary_image.filePath.url
                    tertiary_instance_path = osUtils.get_instance_path_from_image(tertiary_base_path,
                                                                                  device["name"] + "_tertiary"
                                                                                  )

                    if not osUtils.check_path(tertiary_instance_path):
                        if not osUtils.create_thin_provision_instance(tertiary_base_path, 
                                                                      device["name"] + "_tertiary"
                                                                      ):
                            raise Exception("Could not create image instance for image: " + tertiary_base_path)

                    device["tertiaryDiskPath"] = tertiary_instance_path

                cloud_init_path = ''
                if image.type == "linux":
                    # grab the last interface
                    management_interface = device["managementInterface"]
                    # this will come back to haunt me one day. Assume /24 for mgmt network is sprinkled everywhere!
                    management_ip = device["ip"] + "/24"
                    # domain_name, host_name, mgmt_ip, mgmt_interface
                    script_string = ""
                    script_param = ""
                    if device["configScriptId"] != 0:
                        print "Passing script data!"
                        script = Script.objects.get(pk=int(device["configScriptId"]))
                        script_string = script.script
                        script_param = device["configScriptParam"]
                        print script_string
                        print script_param

                    print "Creating cloud init path for linux image"
                    cloud_init_path = osUtils.create_cloud_init_img(device["name"], device["label"],
                                                                    management_ip, management_interface,
                                                                    device["password"], script_string, script_param)

                    print cloud_init_path

                device_xml = render_to_string(domain_xml_path + configuration_file,
                                              {'device': device, 'instancePath': instance_path,
                                               'vm_env': vm_env, 'cloud_init_path': cloud_init_path}
                                              )
                print device_xml
                libvirtUtils.define_domain_from_xml(device_xml)

            if not osUtils.check_is_linux():
                # perform some special hacks for vbox
                management_interfaces = device["managementInterfaces"]
                management_ip = str(management_interfaces[0]["ip"])
                vboxUtils.preconfigure_vmx(device["name"], management_ip)

        except Exception as ex:
            print "Raising exception"
            raise Exception(str(ex))


@csrf_exempt
def launch_web_console(request):
    print "Let's launch a console!"

    required_fields = set(['domain'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    response_data = {"result": True}
    domain = request.POST["domain"]
    print "Got domain of: " + domain
    # this keeps a list of used ports around for us
    wc_dict = request.session.get("webConsoleDict")

    # server = request.META["SERVER_NAME"]
    server = request.get_host().split(":")[0]

    print wc_dict
    if wc_dict is None:
        print "no previous webConsoles Found!"
        wc_dict = {}
        request.session["webConsoleDict"] = wc_dict

    print "OK, do we have this domain?"
    if domain in wc_dict:
        wc_config = wc_dict[domain]
        wc_port = wc_config["wsPort"]
        vnc_port = wc_config["vncPort"]

        if wistarUtils.check_web_socket(server, wc_port):
            print "This WebSocket is already running"

            response_data["message"] = "already running on port: " + wc_port
            response_data["port"] = wc_port
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:

            # Let's verify the vnc port hasn't changed. Could happen if topology is deleted and recreated with
            # same VM names. Rare but happens to me all the time!
            d = libvirtUtils.get_domain_by_name(domain)
            # now grab the configured vncport
            true_vnc_port = libvirtUtils.get_domain_vnc_port(d)

            if true_vnc_port != vnc_port:
                print "Found out of sync vnc port!"
                vnc_port = true_vnc_port

            pid = wistarUtils.launch_web_socket(wc_port, vnc_port, server)
            if pid is not None:
                wc_config["pid"] = pid
                wc_config["vncPort"] = true_vnc_port
                wc_dict[domain] = wc_config
                request.session["webConsoleDict"] = wc_dict

                response_data["message"] = "started WebConsole on port: " + wc_port
                response_data["port"] = wc_port
                return HttpResponse(json.dumps(response_data), content_type="application/json")
            else:
                response_data["result"] = False
                response_data["message"] = "Could not start webConsole"
                return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        print "nope"
        # start the ws ports at 6900
        wc_port = len(wc_dict.keys()) + 6900

        print "using wsPort of " + str(wc_port)
        # get the domain from the hypervisor
        d = libvirtUtils.get_domain_by_name(domain)
        # now grab the configured vncport
        vnc_port = libvirtUtils.get_domain_vnc_port(d)

        print "Got VNC port " + str(vnc_port)
        pid = wistarUtils.launch_web_socket(wc_port, vnc_port, server)

        if pid is None:
            print "oh no"
            response_data["result"] = False
            response_data["message"] = "Could not start webConsole"
            print "returning"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        print "Launched with pid " + str(pid)
        wcConfig = dict()
        wcConfig["pid"] = str(pid)
        wcConfig["vncPort"] = str(vnc_port)
        wcConfig["wsPort"] = str(wc_port)
      
        wc_dict[domain] = wcConfig
        request.session["webConsoleDict"] = wc_dict

        response_data["message"] = "started WebConsole on port: " + str(wc_port)
        response_data["port"] = wc_port
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def get_topology_config(request):
    """
        Grab a json object representing the topology config
        as well as the domain status for each object
        This is useful to get a list of all objects on the topolgy,
        filter for objects of a specific type, and verify their boot up state.
        i.e. to run a command against all Junos devices for example

    """
    if 'topologyId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})

    topology_id = request.POST['topologyId']

    try:
        topo = Topology.objects.get(pk=topology_id)
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_json(topo.json, topology_id)
        domain_status = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")

        context = {'config': config, 'domain_status': domain_status, 'topologyId': topology_id}

        print "returning"
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        print ex
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


@csrf_exempt
def execute_linux_automation(request):
    """
       execute cli command on all linux instances in topology

    """
    if 'topologyId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})

    topology_id = request.POST['topologyId']
    cli = request.POST['cli']

    try:
        topo = Topology.objects.get(pk=topology_id)
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_json(topo.json, topology_id)
        print "Running automation cli: " + cli
        result_string = "Automation Command: " + cli + "\n\n"
        result_string += "==================================="

        for device in config["devices"]:
            if device["type"] == "linux":
                print "running automation cmd on " + device["ip"]
                # host, username, password, cli
                output = linuxUtils.execute_cli(device["ip"], "root", device["password"], cli)
                print "got output: " + output
                result_string += "\n\n"
                result_string += "Instance: " + device["label"] + "\n"
                result_string += output
                result_string += "\n"
                result_string += "----------------------------"

        context = {'result': result_string}

        print "returning"
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        print ex
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


@csrf_exempt
def execute_junos_automation(request):
    """
       execute cli command on all junos instances in topology

    """
    if 'topologyId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})

    topology_id = request.POST['topologyId']
    cli = request.POST['cli']

    try:
        topo = Topology.objects.get(pk=topology_id)
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_json(topo.json, topology_id)
        print "Running automation cli: " + cli
        result_string = "Automation Command: " + cli + "\n\n"
        result_string += "==================================="

        for device in config["devices"]:
            if "junos" in device["type"]:
                print "running automation cmd on " + device["ip"]
                # host, username, password, cli
                output = junosUtils.execute_cli(device["ip"], device["password"], cli)
                print "got output: " + output
                result_string += "\n\n"
                result_string += "Instance: " + device["label"] + "\n"
                result_string += output
                result_string += "\n"
                result_string += "----------------------------"

        context = {'result': result_string}

        print "returning"
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        print ex
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


@csrf_exempt
# query libvirt for all instances that are currently running
# grab configured ip addresses from topology as well.
def get_available_instances(request):

    if 'scriptId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No script Id in request"})

    script_id = request.POST['scriptId']
    script = Script.objects.get(pk=script_id)

    instances = []

    domains = libvirtUtils.list_domains()
    for domain in domains:
        if domain["state"] == "running":
            name = domain["name"]
            topo_id = name.split('_')[0].replace('t', '')
            # print name + " " + topo_id
            topology = Topology.objects.get(pk=topo_id)
            tj = json.loads(topology.json)
            for obj in tj:
                if "userData" in obj and "wistarVm" in obj["userData"]:
                    ip = obj["userData"]["ip"]
                    label = obj["userData"]["label"]
                    obj_type = obj["userData"]["type"]
                    if label == name.split('_')[1]:
                        instance = {
                            'name': name,
                            'ip': ip,
                            'type': obj_type,
                            'topo_id': topo_id
                        }

                        print "Found a running instance for this topology!"
                        instances.append(instance)
                        continue

    context = {'instances': instances, 'script': script}
    return render(request, 'ajax/availableInstances.html', context)


def launch_script(request):
    if 'scriptId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No script Id in request"})

    print request.POST
    script_id = request.POST['scriptId']
    script = Script.objects.get(pk=script_id)
    instances = request.POST.getlist("instances")
    print instances
    configure_access = request.POST["configureAccess"]

    o = "Output from script"
    for instance in instances:
        print instance
        topo_id = instance.split("_")[0].replace('t', '')
        print topo_id
        topology = Topology.objects.get(pk=topo_id)
        tj = json.loads(topology.json)
        for obj in tj:
            if "userData" in obj and "wistarVm" in obj["userData"]:
                label = obj["userData"]["label"]
                if label == instance.split('_')[1]:
                    print "Found instance in topology configuration"
                    ip = str(obj["userData"]["ip"])
                    o += "name: %s, ip %s\n" % (instance, ip)
                    print "name: %s, ip %s" % (instance, ip)
                    password = str(obj["userData"]["password"])
                    management_interface = str(obj["userData"]["mgmtInterface"])
                    if configure_access == "yes":
                        print "Configuring access"
                        o += "Configuring access\n"
                        consoleUtils.preconfig_linux_domain(instance, "root", password, management_interface)

                    print "Pushing script " + script.name
                    linuxUtils.push_remote_script(ip, 'root', password, script.script, script.destination)
                    print "Executing script"
                    o += linuxUtils.execute_cli(ip, 'root', password, script.destination)
                    o += "\n"
                    continue

    context = {'output': o}
    return render(request, 'ajax/scriptOutput.html', context)


@csrf_exempt
def manage_iso(request):

    required_fields = set(['domainName', 'path', 'topologyId', 'action'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain_name = request.POST['domainName']
    file_path = settings.MEDIA_ROOT + "/media/" + request.POST["path"]
    action = request.POST["action"]

    print domain_name
    print file_path
    if action == "attach":
        if libvirtUtils.attach_iso_to_domain(domain_name, file_path):
            context = {'result': "Success"}
            print "iso attached to domain successfully"
        else:
            context = {'result': False}
    else:
        if libvirtUtils.detach_iso_from_domain(domain_name):
            context = {'result': "Success"}
            print "iso detached from domain successfully"
        else:
            context = {'result': False}

    return HttpResponse(json.dumps(context), content_type="application/json")


@csrf_exempt
def list_isos(request):

    required_fields = set(['domainName'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain_name = request.POST['domainName']
    current_iso = libvirtUtils.get_iso_for_domain(domain_name)

    dir_list = osUtils.list_dir(settings.MEDIA_ROOT + '/media')
    print str(dir_list)

    context = {
        'media': dir_list,
        'currentIso': current_iso,
        'mediaDir': settings.MEDIA_ROOT + "/media",
        'domainName': domain_name
        }

    return render(request, 'ajax/manageIso.html', context)


@csrf_exempt
def deploy_stack(request, topology_id):
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
        heat_template = wistarUtils.get_heat_json_from_topology_config(config)
        if not openstackUtils.connect_to_openstack():
            return render(request, 'error.html', {'error': "Could not connect to Openstack"})

        # get the tenant_id of the desired project
        tenant_id = openstackUtils.get_project_id(configuration.openstack_project)
        print "using tenant_id of: %s" % tenant_id
        if tenant_id is None:
            raise Exception("No project found for %s" % configuration.openstack_project)

        # FIXME - verify all images are in glance before jumping off here!
        stack_name = topology.name.replace(' ', '_')
        print openstackUtils.create_stack(stack_name, heat_template)

        return HttpResponseRedirect('/topologies/' + topology_id + '/')

    except Exception as e:
        print "Caught Exception in deploy"
        print str(e)
        return render(request, 'error.html', {'error': str(e)})


@csrf_exempt
def delete_stack(request, topology_id):
    """
    :param request: Django request
    :param topology_id: id of the topology to remove from OpenStack
    :return: redirect to topology detail screen
    """

    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist:
        return render(request, 'error.html', {'error': "Topology not found!"})

    stack_name = topology.name.replace(' ', '_')
    print openstackUtils.delete_stack(stack_name)

    return HttpResponseRedirect('/topologies/' + topology_id + '/')