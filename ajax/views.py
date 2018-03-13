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

import json
import logging
import os
import random
import time

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from common.lib import consoleUtils
from common.lib import junosUtils
from common.lib import libvirtUtils
from common.lib import linuxUtils
from common.lib import openstackUtils
from common.lib import osUtils
from common.lib import wistarUtils
from common.lib.WistarException import WistarException
from images.models import Image
from scripts.models import ConfigTemplate
from scripts.models import Script
from topologies.models import Config
from topologies.models import ConfigSet
from topologies.models import Topology
from wistar import configuration

logger = logging.getLogger(__name__)


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


def preconfig_junos_domain(request):
    response_data = {"result": True, "message": "success"}
    required_fields = set(['domain', 'user', 'password', 'ip', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    user = request.POST["user"]
    password = request.POST['password']
    ip = request.POST['ip']
    mgmt_interface = request.POST['mgmtInterface']

    logger.debug("Configuring domain:" + str(domain))
    try:

        # let's see if we need to kill any webConsole sessions first
        wc_dict = request.session.get("webConsoleDict")
        if wc_dict is not None:
            if domain in wc_dict:
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

        if user != "root":
            response_data["result"] = False
            response_data["message"] = "Junos preconfiguration user must be root!"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        if consoleUtils.preconfig_junos_domain(domain, user, password, ip, mgmt_interface):
            response_data["result"] = True
            response_data["message"] = "Success"
        else:
            response_data["result"] = False
            response_data["message"] = "Could not configure domain"
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def preconfig_linux_domain(request):
    response_data = {"result": True}
    required_fields = set(['domain', 'hostname', 'user', 'password', 'ip', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    user = request.POST["user"]
    password = request.POST['password']
    ip = request.POST['ip']
    mgmt_interface = request.POST['mgmtInterface']
    hostname = request.POST['hostname']

    logger.debug("Configuring linux domain:" + str(domain))
    try:
        response_data["result"] = consoleUtils.preconfig_linux_domain(domain, hostname, user, password, ip,
                                                                      mgmt_interface)
        logger.debug(str(response_data))
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def preconfig_firefly(request):
    response_data = {"result": True}
    required_fields = set(['domain', 'user', 'password', 'mgmtInterface'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain = request.POST['domain']
    user = request.POST["user"]
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

        logger.debug("Configuring management Access")
        if consoleUtils.preconfig_junos_domain(domain, user, password, ip, mgmt_interface):
            logger.debug("Configuring Firefly management zones:" + str(domain))
            time.sleep(3)
            response_data["result"] = consoleUtils.preconfig_firefly(domain, user, password, mgmt_interface)
        else:
            response_data["result"] = False
            response_data["message"] = "Could not configure Firefly access"

        return HttpResponse(json.dumps(response_data), content_type="application/json")

    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def config_junos_interfaces(request):
    response_data = {"result": True}
    required_fields = set(['password', 'ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    user = request.POST["user"]
    password = request.POST['password']
    logger.debug("Configuring interfaces for " + str(ip))
    try:
        response_data["result"] = junosUtils.config_junos_interfaces(ip, user, password)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def execute_cli(request):
    response_data = {"result": True}
    required_fields = set(['ip', 'user', 'pw', 'cli'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    user = request.POST['user']
    pw = request.POST['pw']
    cli = request.POST['cli']

    result = junosUtils.execute_cli(ip, user, pw, cli)
    if result is None:
        response_data["result"] = False
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:

        response_data["output"] = result
        return HttpResponse(json.dumps(response_data), content_type="application/json")


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


def get_junos_startup_state(request):
    response_data = dict()
    response_data["console"] = False
    response_data["power"] = False
    response_data["network"] = False

    required_fields = set(['name'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    name = request.POST['name']

    # always check network if possible regardless of deployment_backend
    if "ip" in request.POST:
        # this instance is auto-configured, so we can just check for IP here
        response_data["network"] = osUtils.check_ip(request.POST["ip"])

    if configuration.deployment_backend == "kvm" and libvirtUtils.is_domain_running(name):
        # topologies/edit will fire multiple calls at once
        # let's just put a bit of a breather between each one
        response_data["power"] = True
        if "ip" not in request.POST:
            time.sleep(random.randint(0, 10) * .10)
            response_data["console"] = consoleUtils.is_junos_device_at_prompt(name)

    elif configuration.deployment_backend == "openstack":

        time.sleep(random.randint(0, 20) * .10)
        response_data["power"] = True
        # console no longer supported in openstack deployments
        response_data["console"] = False

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def get_linux_startup_state(request):
    response_data = dict()
    response_data["console"] = False
    response_data["power"] = False
    response_data["network"] = False

    required_fields = set(['name'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    name = request.POST['name']
    # always check network if possible regardless of deployment_backend
    if "ip" in request.POST:
        # this instance is auto-configured, so we can just check for IP here
        response_data["network"] = osUtils.check_ip(request.POST["ip"])

    if configuration.deployment_backend == "openstack":
        if openstackUtils.connect_to_openstack():
            time.sleep(random.randint(0, 10) * .10)
            response_data["power"] = True
            # as of 2018-01-01 we no longer support openstack console, this is dead code
            # response_data["console"] = consoleUtils.is_linux_device_at_prompt(name)
            response_data['console'] = False
    else:
        if libvirtUtils.is_domain_running(name):
            time.sleep(random.randint(0, 10) * .10)
            response_data["power"] = True
            # let's check the console only if we do not have network available to check
            if "ip" not in request.POST:
                response_data["console"] = consoleUtils.is_linux_device_at_prompt(name)

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def get_junos_config(request):
    """
    No longer used
    :param request:
    :return:
    """
    response_data = {"result": True}
    required_fields = set(['ip', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip = request.POST['ip']
    password = request.POST['password']
    logger.debug("Getting Config for " + str(ip))
    try:
        xml = junosUtils.get_config(ip, password)
        logger.debug(xml)

        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def get_config_templates(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    template_list = ConfigTemplate.objects.all().order_by('modified')

    ip = request.POST['ip']
    context = {'template_list': template_list, 'ip': ip}
    return render(request, 'ajax/configTemplates.html', context)


def get_scripts(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    script_list = Script.objects.all().order_by('modified')

    ip = request.POST['ip']
    context = {'script_list': script_list, 'ip': ip}
    return render(request, 'ajax/scripts.html', context)


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

    logger.debug("Executing script " + script.name)

    try:
        linuxUtils.push_remote_script(ip, username, password, script.script, script.destination)
        output = linuxUtils.execute_cli(ip, username, password, script.destination)

        context = {'output': output}
        return render(request, 'ajax/scriptOutput.html', context)

    except WistarException as we:
        context = {'output': str(we)}
        return render(request, 'ajax/scriptOutput.html', context)


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
            logger.debug("Configuring interfaces for " + str(source_ip))
            if source_type == "linux":
                source_results = linuxUtils.set_interface_ip_address(source_ip, "root", source_pw, source_interface,
                                                                     source_port_ip)
            else:
                source_results = junosUtils.set_interface_ip_address(source_ip, source_pw, source_interface,
                                                                     source_port_ip)

            if source_results is False:
                raise WistarException("Couldn't set ip address on source VM")

        if target_ip != "0.0.0.0":
            if target_type == "linux":
                target_results = linuxUtils.set_interface_ip_address(target_ip, "root", target_pw, target_interface,
                                                                     target_port_ip)
            else:
                target_results = junosUtils.set_interface_ip_address(target_ip, target_pw, target_interface,
                                                                     target_port_ip)

            if target_results is False:
                raise WistarException("Couldn't set ip address on target VM")

        logger.debug("saving sync data on topology json as well")
        topology = Topology.objects.get(pk=topology_id)
        topology.json = json_data
        topology.save()

        response_data["result"] = "Success"
        logger.debug(str(response_data))
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except WistarException as we:
        logger.debug(we)
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def start_topology(request):
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST['topologyId']

    delay_str = request.POST.get('delay', '180')

    try:
        delay = int(delay_str)
    except ValueError:
        delay = 180

    if topology_id == "":
        logger.debug("Found a blank topoId!")
        return render(request, 'ajax/ajaxError.html', {'error': "Blank Topology Id found"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")
    network_list = []

    if configuration.deployment_backend == "kvm":
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")

    for network in network_list:
        logger.debug("Starting network: " + network["name"])
        if libvirtUtils.start_network(network["name"]):
            time.sleep(1)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start network: " + network["name"]})

    num_domains = len(domain_list)
    iter_counter = 1
    for domain in domain_list:
        logger.debug("Starting domain " + domain["name"])
        if libvirtUtils.is_domain_running(domain["name"]):
            # skip already started domains
            logger.debug("domain %s is already started" % domain["name"])
            iter_counter += 1
            continue

        if libvirtUtils.start_domain(domain["uuid"]):
            # let's not sleep after the last domain has been started
            if iter_counter < num_domains:
                time.sleep(delay)
            iter_counter += 1
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not start domain: " + domain["name"]})

    logger.debug("All domains started")
    return refresh_deployment_status(request)


def pause_topology(request):
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST['topologyId']

    if topology_id == "":
        logger.debug("Found a blank topoId!")
        return render(request, 'ajax/ajaxError.html', {'error': "Blank Topology Id found"})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")

    for domain in domain_list:
        if domain["state"] == "running":
            logger.debug("Pausing domain " + domain["name"])
            libvirtUtils.suspend_domain(domain["uuid"])
            time.sleep(5)
        else:
            logger.debug("Domain %s is already shut down" % domain["name"])

    network_list = []
    if osUtils.check_is_linux():
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")

    for network in network_list:
        logger.debug("Stopping network: " + network["name"])
        if libvirtUtils.stop_network(network["name"]):
            time.sleep(1)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop network: " + network["name"]})

    logger.debug("All domains paused")
    return refresh_deployment_status(request)


def refresh_deployment_status(request):
    logger.debug('---- ajax refresh_deployment_status ----')
    required_fields = set(['topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    topology_id = request.POST['topologyId']

    if topology_id == "":
        logger.debug("Found a blank topology_id, returning full hypervisor status")
        return refresh_hypervisor_status(request)

    if configuration.deployment_backend == "openstack":
        logger.info('Refresh openstack deployment status')
        return refresh_openstack_deployment_status(request, topology_id)
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
    logger.debug('---- ajax refresh_openstack_deployment_status ----')
    if not openstackUtils.connect_to_openstack():
        error_message = "Could not connect to Openstack!"
        logger.error(error_message)
        return render(request, 'ajax/ajaxError.html', {'error': error_message})

    topology = Topology.objects.get(pk=topology_id)
    stack_name = topology.name.replace(' ', '_')
    stack_details = openstackUtils.get_stack_details(stack_name)
    stack_resources = dict()
    logger.debug(stack_details)
    if stack_details is not None and 'stack_status' in stack_details and 'COMPLETE' in stack_details["stack_status"]:
        stack_resources = openstackUtils.get_stack_resources(stack_name, stack_details["id"])

    if hasattr(configuration, 'openstack_horizon_url'):
        horizon_url = configuration.openstack_horizon_url
    else:
        horizon_url = 'http://' + configuration.openstack_host + '/dashboard'

    context = {"stack": stack_details, "topology_id": topology.id,
               "openstack_host": configuration.openstack_host,
               "openstack_horizon_url": horizon_url,
               "stack_resources": stack_resources
               }
    return render(request, 'ajax/openstackDeploymentStatus.html', context)


def refresh_host_load(request):
    (one, five, ten) = os.getloadavg()
    load = {'one': one, 'five': five, 'ten': ten}
    context = {'load': load}
    return render(request, 'ajax/hostLoad.html', context)


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


def check_ip(request):
    required_fields = set(['ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    ip_address = request.POST['ip']
    ip_exists = osUtils.check_ip(ip_address)
    response_data = {"result": ip_exists}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def get_available_ip(request):
    # just grab the next available IP that is not currently
    # reserved via DHCP. This only get's called from topologies/new.html
    # when we've allocated all the IPs to various topologies
    # this allows new topologies to be built with overlapping
    # IP addresses. This makes the attempt to use 'old' ips that
    # are at least not still in use.
    logger.info("getting ips that are currently reserved via DHCP")
    all_used_ips = wistarUtils.get_consumed_management_ips()
    logger.debug(all_used_ips)
    next_ip = wistarUtils.get_next_ip(all_used_ips, 2)
    logger.debug(next_ip)
    response_data = {"result": next_ip}
    return HttpResponse(json.dumps(response_data), content_type="application/json")


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
            logger.debug("Removing non-existent ISO from domain")
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

        domain = libvirtUtils.get_domain_by_uuid(domain_id)
        domain_name = domain.name()

        source_file = libvirtUtils.get_image_for_domain(domain_id)
        if libvirtUtils.undefine_domain(domain_id):
            if source_file is not None:
                osUtils.remove_instance(source_file)
                osUtils.remove_cloud_init_seed_dir_for_domain(domain_name)

            return refresh_deployment_status(request)
        else:
            return render(request, 'ajax/ajaxError.html', {'error': "Could not stop domain!"})
    else:
        return render(request, 'ajax/ajaxError.html', {'error': "Unknown Parameters in POST!"})


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


def apply_config_template(request):
    logger.debug("Pushing Config Template")
    response_data = {"result": True, "message": "Applied configuration successfully"}

    required_fields = set(['id', 'ip', 'user', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_template_id = request.POST['id']
    ip = request.POST['ip']
    user = request.POST["user"]
    password = request.POST['password']

    config_template = ConfigTemplate.objects.get(pk=config_template_id)
    template = config_template.template
    cleaned_template = template.replace('\r\n', '\n')
    logger.debug(cleaned_template)
    if junosUtils.push_config(cleaned_template, ip, user, password):
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Could not apply config template"
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def apply_junos_set_config(request):
    logger.debug("Pushing Set Config")
    response_data = {"result": True, "message": "Applied configuration successfully"}

    required_fields = set(['config', 'ip', 'user', 'password'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config = request.POST['config']
    ip = request.POST['ip']
    user = request.POST["user"]
    password = request.POST['password']

    logger.debug(config)
    if junosUtils.push_config(config, ip, user, password):
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Could not apply config template"
        return HttpResponse(json.dumps(response_data), content_type="application/json")


def push_config_set(request):
    logger.debug("Pushing ConfigSet")
    response_data = {"result": True}

    required_fields = set(['id'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_set_id = request.POST['id']

    logger.debug("csid is " + config_set_id)

    cs = ConfigSet.objects.get(pk=config_set_id)

    configs = Config.objects.filter(configSet=cs)

    for config in configs:
        logger.debug(config.ip)
        try:
            junosUtils.push_config_string(config.deviceConfig, config.ip, config.user, config.password)
        except Exception as e:
            logger.debug("Could not reload config on " + str(config.ip))
            response_data["message"] = response_data["message"] + " Error pushing to " + str(config.ip)
            logger.debug(e)

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def delete_config_set(request):
    logger.debug("Deleting ConfigSet")
    response_data = {"result": True}

    required_fields = set(['id'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    config_set_id = request.POST['id']
    cs = ConfigSet.objects.get(pk=config_set_id)
    cs.delete()

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def multi_clone_topology(request):
    response_data = {"result": True}
    required_fields = set(['clones', 'topologyId'])
    if not required_fields.issubset(request.POST):
        response_data["message"] = "Invalid Parameters in Post"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    topology_id = request.POST["topologyId"]
    num_clones = request.POST["clones"]

    logger.debug(num_clones)

    topology = Topology.objects.get(pk=topology_id)
    orig_name = topology.name
    json_data = topology.json
    i = 0
    while i < int(num_clones):

        nj = wistarUtils.clone_topology(json_data)
        if nj is not None:
            new_topology = topology
            new_topology.name = orig_name + " " + str(i + 1).zfill(2)
            new_topology.json = nj
            json_data = new_topology.json
            new_topology.id = None
            new_topology.save()

        i += 1

    return HttpResponse(json.dumps(response_data), content_type="application/json")


def redeploy_topology(request):
    required_fields = set(['json', 'topologyId'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})

    topology_id = request.POST['topologyId']
    j = request.POST['json']
    try:
        topo = Topology.objects.get(pk=topology_id)
        topo.json = j
        topo.save()
    except ObjectDoesNotExist:
        return render(request, 'ajax/ajaxError.html', {'error': "Topology doesn't exist"})

    try:
        domains = libvirtUtils.get_domains_for_topology(topology_id)
        config = wistarUtils.load_config_from_topology_json(topo.json, topology_id)

        logger.debug('checking for orphaned domains first')
        # find domains we no longer need
        for d in domains:
            logger.debug('checking domain: %s' % d['name'])
            found = False
            for config_device in config["devices"]:
                if config_device['name'] == d['name']:
                    found = True
                    continue

            if not found:
                logger.info("undefine domain: " + d["name"])
                source_file = libvirtUtils.get_image_for_domain(d["uuid"])
                if libvirtUtils.undefine_domain(d["uuid"]):
                    if source_file is not None:
                        osUtils.remove_instance(source_file)

                    osUtils.remove_cloud_init_seed_dir_for_domain(d['name'])

    except Exception as e:
        logger.debug("Caught Exception in redeploy")
        logger.debug(str(e))
        return render(request, 'ajax/ajaxError.html', {'error': str(e)})

    # forward onto deploy topo
    try:
        inline_deploy_topology(config)
    except Exception as e:
        logger.debug("Caught Exception in inline_deploy")
        logger.debug(str(e))
        return render(request, 'ajax/ajaxError.html', {'error': str(e)})

    return refresh_deployment_status(request)


def deploy_topology(request):
    if 'topologyId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No Topology Id in request"})

    topology_id = request.POST['topologyId']
    try:
        topo = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist:
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})

    try:
        # let's parse the json and convert to simple lists and dicts
        config = wistarUtils.load_config_from_topology_json(topo.json, topology_id)
        # FIXME - should this be pushed into another module?
        inline_deploy_topology(config)
    except Exception as e:
        logger.debug("Caught Exception in deploy")
        logger.debug(str(e))
        return render(request, 'ajax/ajaxError.html', {'error': str(e)})

    domain_list = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")
    network_list = []

    if osUtils.check_is_linux():
        network_list = libvirtUtils.get_networks_for_topology("t" + topology_id + "_")
    context = {'domain_list': domain_list, 'network_list': network_list, 'isLinux': True, 'topologyId': topology_id}
    return render(request, 'ajax/deploymentStatus.html', context)


def inline_deploy_topology(config):
    # only create networks on Linux/KVM
    logger.debug("Checking if we should create networks first!")
    if osUtils.check_is_linux():
        for network in config["networks"]:
            try:
                if not libvirtUtils.network_exists(network["name"]):
                    logger.debug("Rendering networkXml for: %s" % network["name"])
                    network_xml = render_to_string("ajax/kvm/network.xml", {'network': network})
                    logger.debug(network_xml)
                    libvirtUtils.define_network_from_xml(network_xml)
                    time.sleep(.5)

                logger.debug("Starting network")
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
    vm_env["cache"] = configuration.filesystem_cache_mode
    vm_env["io"] = configuration.filesystem_io_mode

    if osUtils.check_is_linux() and osUtils.check_is_ubuntu():
        vm_env["emulator"] = "/usr/bin/kvm-spice"
        vm_env["pcType"] = "pc"

    # by default, we use kvm as the hypervisor
    domain_xml_path = "ajax/kvm/"
    if not osUtils.check_is_linux():
        # if we're not on Linux, then let's try to use vbox instead
        domain_xml_path = "ajax/vbox/"

    for device in config["devices"]:
        domain_exists = False
        try:
            if libvirtUtils.domain_exists(device['name']):
                domain_exists = True
                device_domain = libvirtUtils.get_domain_by_name(device['name'])
                device['domain_uuid'] = device_domain.UUIDString()
            else:
                device['domain_uuid'] = ''

            # if not libvirtUtils.domain_exists(device["name"]):
            logger.debug("Rendering deviceXml for: %s" % device["name"])

            configuration_file = device["configurationFile"]
            logger.debug("using config file: " + configuration_file)

            logger.debug(device)

            image = Image.objects.get(pk=device["imageId"])
            image_base_path = settings.MEDIA_ROOT + "/" + image.filePath.url
            instance_path = osUtils.get_instance_path_from_image(image_base_path, device["name"])

            secondary_disk = ""
            tertiary_disk = ""

            if not osUtils.check_path(instance_path):
                if device["resizeImage"] > 0:
                    logger.debug('resizing image')
                    if not osUtils.create_thick_provision_instance(image_base_path,
                                                                   device["name"],
                                                                   device["resizeImage"]):
                        raise Exception("Could not resize image instance for image: " + device["name"])

                else:
                    if not osUtils.create_thin_provision_instance(image_base_path, device["name"]):
                        raise Exception("Could not create image instance for image: " + image_base_path)

            if "type" in device["secondaryDiskParams"]:
                secondary_disk = wistarUtils.create_disk_instance(device, device["secondaryDiskParams"])

            if "type" in device["tertiaryDiskParams"]:
                tertiary_disk = wistarUtils.create_disk_instance(device, device["tertiaryDiskParams"])

            cloud_init_path = ''
            if device["cloudInitSupport"]:
                # grab the last interface
                management_interface = device["managementInterface"]

                # grab the prefix len from the management subnet which is in the form 192.168.122.0/24
                if '/' in configuration.management_subnet:
                    management_prefix_len = configuration.management_subnet.split('/')[1]
                else:
                    management_prefix_len = '24'

                management_ip = device['ip'] + '/' + management_prefix_len

                # domain_name, host_name, mgmt_ip, mgmt_interface
                script_string = ""
                script_param = ""

                if device["configScriptId"] != 0:
                    logger.debug("Passing script data!")
                    try:
                        script = Script.objects.get(pk=int(device["configScriptId"]))
                        script_string = script.script
                        script_param = device["configScriptParam"]
                        logger.debug(script_string)
                        logger.debug(script_param)
                    except ObjectDoesNotExist:
                        logger.info('config script was specified but was not found!')

                logger.debug("Creating cloud init path for linux image")
                cloud_init_path = osUtils.create_cloud_init_img(device["name"], device["label"],
                                                                management_ip, management_interface,
                                                                device["password"], script_string, script_param)

                logger.debug(cloud_init_path)

            device_xml = render_to_string(domain_xml_path + configuration_file,
                                          {'device': device, 'instancePath': instance_path,
                                           'vm_env': vm_env, 'cloud_init_path': cloud_init_path,
                                           'secondary_disk_path': secondary_disk,
                                           'tertiary_disk_path': tertiary_disk}
                                          )
            logger.debug(device_xml)
            libvirtUtils.define_domain_from_xml(device_xml)

            if not domain_exists:
                logger.debug("Reserving IP with dnsmasq")
                management_mac = libvirtUtils.get_management_interface_mac_for_domain(device["name"])
                libvirtUtils.reserve_management_ip_for_mac(management_mac, device["ip"], device["name"])

        except Exception as ex:
            logger.debug("Raising exception")
            raise Exception(str(ex))


def launch_web_console(request):
    logger.debug("Let's launch a console!")

    required_fields = set(['domain'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    response_data = {"result": True}
    domain = request.POST["domain"]
    logger.debug("Got domain of: " + domain)
    # this keeps a list of used ports around for us
    wc_dict = request.session.get("webConsoleDict")

    # server = request.META["SERVER_NAME"]
    server = request.get_host().split(":")[0]

    logger.debug(wc_dict)
    if wc_dict is None:
        logger.debug("no previous webConsoles Found!")
        wc_dict = {}
        request.session["webConsoleDict"] = wc_dict

    logger.debug("OK, do we have this domain?")
    if domain in wc_dict:
        wc_config = wc_dict[domain]
        wc_port = wc_config["wsPort"]
        vnc_port = wc_config["vncPort"]

        if wistarUtils.check_web_socket(server, wc_port):
            logger.debug("This WebSocket is already running")

            response_data["message"] = "already running on port: " + wc_port
            response_data["port"] = wc_port
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:

            # Let's verify the vnc port hasn't changed. Could happen if topology is deleted and recreated with
            # same VM names. Rare but happens to me all the time!
            d = libvirtUtils.get_domain_by_name(domain)

            if not libvirtUtils.is_domain_running(domain):
                libvirtUtils.start_domain_by_name(domain)

            # now grab the configured vncport
            true_vnc_port = libvirtUtils.get_domain_vnc_port(d)

            if true_vnc_port != vnc_port:
                logger.debug("Found out of sync vnc port!")
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
        logger.debug("nope")
        # start the ws ports at 6900
        wc_port = len(wc_dict.keys()) + 6900

        logger.debug("using wsPort of " + str(wc_port))
        # get the domain from the hypervisor
        d = libvirtUtils.get_domain_by_name(domain)
        # now grab the configured vncport
        vnc_port = libvirtUtils.get_domain_vnc_port(d)

        logger.debug("Got VNC port " + str(vnc_port))
        pid = wistarUtils.launch_web_socket(wc_port, vnc_port, server)

        if pid is None:
            logger.debug("oh no")
            response_data["result"] = False
            response_data["message"] = "Could not start webConsole"
            logger.debug("returning")
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        logger.debug("Launched with pid " + str(pid))
        wcConfig = dict()
        wcConfig["pid"] = str(pid)
        wcConfig["vncPort"] = str(vnc_port)
        wcConfig["wsPort"] = str(wc_port)

        wc_dict[domain] = wcConfig
        request.session["webConsoleDict"] = wc_dict

        response_data["message"] = "started WebConsole on port: " + str(wc_port)
        response_data["port"] = wc_port
        return HttpResponse(json.dumps(response_data), content_type="application/json")


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
        config = wistarUtils.load_config_from_topology_json(topo.json, topology_id)
        domain_status = libvirtUtils.get_domains_for_topology("t" + topology_id + "_")

        context = {'config': config, 'domain_status': domain_status, 'topologyId': topology_id}

        logger.debug("returning")
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        logger.debug(ex)
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


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
        config = wistarUtils.load_config_from_topology_json(topo.json, topology_id)
        logger.debug("Running automation cli: " + cli)
        result_string = "Automation Command: " + cli + "\n\n"
        result_string += "==================================="

        for device in config["devices"]:
            if device["type"] == "linux" or "ubuntu" in device["type"]:
                logger.debug("running automation cmd on " + device["ip"])
                # host, username, password, cli
                try:
                    output = linuxUtils.execute_cli(device["ip"], device["user"], device["password"], cli)
                except Exception as e:
                    logger.info("Could not execute linux cli on host: %s" % device["ip"])
                    output = str(e)

                logger.debug("got output: " + output)
                result_string += "\n\n"
                result_string += "Instance: " + device["label"] + "\n"
                result_string += output
                result_string += "\n"
                result_string += "----------------------------"

        context = {'result': result_string}

        logger.debug("returning")
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        logger.debug(ex)
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


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
        config = wistarUtils.load_config_from_topology_json(topo.json, topology_id)
        logger.debug("Running automation cli: " + cli)
        result_string = "Automation Command: " + cli + "\n\n"
        result_string += "==================================="

        for device in config["devices"]:
            logger.debug("Child status is: " + str(device["isChild"]))
            # only execute cli commands on parent VMs (REs in this case)
            if "junos" in device["type"] and device["isChild"] is False:
                logger.debug("running automation cmd on " + device["ip"])

                # host, username, password, cli
                output = junosUtils.execute_cli(device["ip"], device["user"], device["password"], cli)
                logger.debug("got output: " + output)
                result_string += "\n\n"
                result_string += "Instance: " + device["label"] + "\n"
                result_string += output
                result_string += "\n"
                result_string += "----------------------------"

        context = {'result': result_string}

        logger.debug("returning")
        return HttpResponse(json.dumps(context), content_type="application/json")
    except Exception as ex:
        logger.debug(ex)
        return render(request, 'ajax/ajaxError.html', {'error': "Topology not found!"})


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
            # logger.debug(name + " " + topo_id)
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

                        logger.debug("Found a running instance for this topology!")
                        instances.append(instance)
                        continue

    context = {'instances': instances, 'script': script}
    return render(request, 'ajax/availableInstances.html', context)


def launch_script(request):
    if 'scriptId' not in request.POST:
        return render(request, 'ajax/ajaxError.html', {'error': "No script Id in request"})

    logger.debug(request.POST)
    script_id = request.POST['scriptId']
    script = Script.objects.get(pk=script_id)
    instances = request.POST.getlist("instances")
    logger.debug(instances)
    configure_access = request.POST["configureAccess"]

    o = "Output from script"
    for instance in instances:
        logger.debug(instance)
        topo_id = instance.split("_")[0].replace('t', '')
        logger.debug(topo_id)
        topology = Topology.objects.get(pk=topo_id)
        tj = json.loads(topology.json)
        for obj in tj:
            if "userData" in obj and "wistarVm" in obj["userData"]:
                label = obj["userData"]["label"]
                if label == instance.split('_')[1]:
                    logger.debug("Found instance in topology configuration")
                    ip = str(obj["userData"]["ip"])
                    o += "name: %s, ip %s\n" % (instance, ip)
                    logger.debug("name: %s, ip %s" % (instance, ip))
                    user = str(obj["userData"]["user"])
                    password = str(obj["userData"]["password"])
                    management_interface = str(obj["userData"]["mgmtInterface"])
                    if configure_access == "yes":
                        logger.debug("Configuring access")
                        o += "Configuring access\n"
                        consoleUtils.preconfig_linux_domain(instance, user, password, management_interface)

                    logger.debug("Pushing script " + script.name)
                    linuxUtils.push_remote_script(ip, user, password, script.script, script.destination)
                    logger.debug("Executing script")
                    o += linuxUtils.execute_cli(ip, user, password, script.destination)
                    o += "\n"
                    continue

    context = {'output': o}
    return render(request, 'ajax/scriptOutput.html', context)


def manage_iso(request):
    required_fields = set(['domainName', 'path', 'topologyId', 'action'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain_name = request.POST['domainName']
    file_path = settings.MEDIA_ROOT + "/media/" + request.POST["path"]
    action = request.POST["action"]

    logger.debug(domain_name)
    logger.debug(file_path)
    if action == "attach":
        if libvirtUtils.attach_iso_to_domain(domain_name, file_path):
            context = {'result': "Success"}
            logger.debug("iso attached to domain successfully")
        else:
            context = {'result': False}
    else:
        if libvirtUtils.detach_iso_from_domain(domain_name):
            context = {'result': "Success"}
            logger.debug("iso detached from domain successfully")
        else:
            context = {'result': False}

    return HttpResponse(json.dumps(context), content_type="application/json")


def list_isos(request):
    required_fields = set(['domainName'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', {'error': "Invalid Parameters in POST"})

    domain_name = request.POST['domainName']
    current_iso = libvirtUtils.get_iso_for_domain(domain_name)

    dir_list = osUtils.list_dir(settings.MEDIA_ROOT + '/media')
    logger.debug(str(dir_list))

    context = {
        'media': dir_list,
        'currentIso': current_iso,
        'mediaDir': settings.MEDIA_ROOT + "/media",
        'domainName': domain_name
    }

    return render(request, 'ajax/manageIso.html', context)


def deploy_stack(request, topology_id):
    """
    :param request: Django request
    :param topology_id: id of the topology to export
    :return: renders the heat template
    """
    try:
        topology = Topology.objects.get(pk=topology_id)
    except ObjectDoesNotExist:
        return render(request, 'error.html', {'error': "Topology not found!"})

    try:
        # generate a stack name
        # FIXME should add a check to verify this is a unique name
        stack_name = topology.name.replace(' ', '_')

        # let's parse the json and convert to simple lists and dicts
        logger.debug("loading config")
        config = wistarUtils.load_config_from_topology_json(topology.json, topology_id)
        logger.debug("Config is loaded")
        heat_template = wistarUtils.get_heat_json_from_topology_config(config, stack_name)
        logger.debug("heat template created")
        if not openstackUtils.connect_to_openstack():
            return render(request, 'error.html', {'error': "Could not connect to Openstack"})

        # get the tenant_id of the desired project
        tenant_id = openstackUtils.get_project_id(configuration.openstack_project)
        logger.debug("using tenant_id of: %s" % tenant_id)
        if tenant_id is None:
            raise Exception("No project found for %s" % configuration.openstack_project)

        # FIXME - verify all images are in glance before jumping off here!

        logger.debug(openstackUtils.create_stack(stack_name, heat_template))

        return HttpResponseRedirect('/topologies/' + topology_id + '/')

    except Exception as e:
        logger.debug("Caught Exception in deploy")
        logger.debug(str(e))
        return render(request, 'error.html', {'error': str(e)})


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
    if openstackUtils.connect_to_openstack():
        logger.debug(openstackUtils.delete_stack(stack_name))

    return HttpResponseRedirect('/topologies/' + topology_id + '/')
