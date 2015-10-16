
from django.http import HttpResponseRedirect, HttpResponse
from django.core.exceptions import ObjectDoesNotExist

from common.lib import wistarUtils
from common.lib import libvirtUtils
from common.lib import consoleUtils
from common.lib import linuxUtils
from common.lib import osUtils

from topologies.models import Topology
from scripts.models import Script

from ajax import views as av
from api.lib import apiUtils

import json
import time

# FIXME = debug should be a global setting
debug = True


def index(request):
    return HttpResponseRedirect('/topologies/')


def get_topology_status(request):
    """
        get the topology id and status for the given topology_name
        returns json object indicating sandbox status
        1. check exists
        2. check deployed
        3. check booted
        4. check console ready
        5. check ips
    """
    context = dict()

    context["status"] = "not ready"
    context["deploy-status"] = "not ready"
    context["boot-status"] = "not ready"
    context["console-status"] = "not ready"
    context["configured-status"] = "not ready"
    context["message"] = "no message"
    context["topologyId"] = "0"

    if 'topology_name' not in request.POST:
        context["message"] = "Invalid parameters in POST"
        return HttpResponse(json.dumps(context), content_type="application/json")

    topology_name = request.POST['topology_name']

    try:
        topology = Topology.objects.get(name=topology_name)

    except ObjectDoesNotExist:
        context["message"] = "topology with name '%s' does not exist" % topology_name
        return HttpResponse(json.dumps(context), content_type="application/json")

    try:

        print "Got topo " + str(topology.id)
        domain_prefix = "t%s_" % topology.id

        domains = libvirtUtils.get_domains_for_topology(domain_prefix)

        if len(domains) == 0:
            context["message"] = "not yet deployed!"
            return HttpResponse(json.dumps(context), content_type="application/json")

        context["deploy-status"] = "ready"

        for d in domains:
            if d["state"] == "shut off":
                context["message"] = "not all instances are started"
                return HttpResponse(json.dumps(context), content_type="application/json")

        context["boot-status"] = "ready"

        raw_json = json.loads(topology.json)
        for jsonObject in raw_json:
            if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                ud = jsonObject["userData"]
                image_type = ud["type"]
                domain_name = domain_prefix + ud["label"]
                if image_type == "linux":
                    if not consoleUtils.is_linux_device_at_prompt(domain_name):
                        print "%s does not have a console ready" % domain_name
                        context["message"] = "not all instances have a console ready"
                        return HttpResponse(json.dumps(context), content_type="application/json")
                    # FIXME - add junos support here

        context["console-status"] = "ready"

        for jsonObject in raw_json:
            if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                ud = jsonObject["userData"]
                ip = ud["ip"]
                if not osUtils.check_ip(ip):
                    context["message"] = "not all instances have a management IP"
                    return HttpResponse(json.dumps(context), content_type="application/json")

        context["configured-status"] = "ready"

        context["status"] = "ready"
        context["message"] = "Sandbox is fully booted and available"
        return HttpResponse(json.dumps(context), content_type="application/json")

    except Exception as ex:
        print str(ex)
        context["message"] = "Caught Exception!"
        return HttpResponse(json.dumps(context), content_type="application/json")


def start_topology(request):
    """
        verify the topology exists and is started!
        required parameters: topology_name, id of which to clone, cloud_init data
        returns json { "status": "running|unknown|powered off", "topology_id": "0" }

    """
    context = {"status": "unknown"}

    required_fields = set(['topology_name', 'clone_id', 'script_id', 'script_param'])
    if not required_fields.issubset(request.POST):
        context["status"] = "unknown"
        context["message"] = "Invalid parameters in POST"
        return HttpResponse(json.dumps(context), content_type="application/json")

    topology_name = request.POST['topology_name']
    clone_id = request.POST['clone_id']
    script_id = request.POST['script_id']
    script_param = request.POST['script_param']

    try:
        # get the topology by name
        topo = Topology.objects.get(name=topology_name)

    except ObjectDoesNotExist:
        # uh-oh! it doesn't exist, let's clone it and keep going
        # clone the topology with the new name specified!
        topology = Topology.objects.get(pk=clone_id)

        # get a list of all the currently used IPs defined
        all_used_ips = apiUtils.get_used_ips()
        print str(all_used_ips)

        raw_json = json.loads(topology.json)
        for jsonObject in raw_json:
            if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                ud = jsonObject["userData"]
                ip = ud["ip"]
                ip_octets = ip.split('.')
                # get the next available ip
                next_ip = apiUtils.get_next_ip(all_used_ips, 2)
                # mark it as used so it won't appear in the next iteration
                all_used_ips.append(next_ip)

                ip_octets[3] = str(next_ip)
                newIp = ".".join(ip_octets)
                ud["ip"] = newIp

                ud["configScriptId"] = script_id
                ud["configScriptParam"] = script_param

        topo = Topology(name=topology_name, description="Sandbox Clone from " + clone_id, json=json.dumps(raw_json))
        topo.save()

    try:

        # by this point, the topology already exists
        print "Got topo " + str(topo.id)
        domain_status = libvirtUtils.get_domains_for_topology("t" + str(topo.id) + "_")

        if len(domain_status) == 0:
            # it has not yet been deployed!
            print "not yet deployed!"

            # let's parse the json and convert to simple lists and dicts
            config = wistarUtils.load_json(topo.json, topo.id)

            print "Deploying to hypervisor now"
            # FIXME - should this be pushed into another module?
            av.inline_deploy_topology(config)
            time.sleep(1)

    except Exception as e:
        print str(e)
        context["status"] = "unknown"
        context["message"] = "Exception"
        return HttpResponse(json.dumps(context), content_type="application/json")

    try:
        # at this point, the topology now exists and is deployed!
        network_list = libvirtUtils.get_networks_for_topology("t" + str(topo.id) + "_")
        domain_list = libvirtUtils.get_domains_for_topology("t" + str(topo.id) + "_")

        for network in network_list:
            libvirtUtils.start_network(network["name"])

        time.sleep(1)
        for domain in domain_list:
            time.sleep(10)
            libvirtUtils.start_domain(domain["uuid"])

        context = {'status': 'booting', 'topologyId': topo.id, 'message': 'sandbox is booting'}

        print "returning"
        return HttpResponse(json.dumps(context), content_type="application/json")

    except Exception as ex:
        print str(ex)
        context["status"] = "unknown"
        context["message"] = "Caught Exception %s" % ex
        return HttpResponse(json.dumps(context), content_type="application/json")


def configure_topology(request):
    """
        configures the topology with the correct access information!
        required parameters: topology_name, id of which to clone, cloud_init data
        returns json { "status": "running|unknown|powered off", "topology_id": "0" }

    """
    context = {"status": "unknown"}

    required_fields = set(['topology_name', 'script_id', 'script_data'])
    if not required_fields.issubset(request.POST):
        context["status"] = "unknown"
        context["message"] = "Invalid parameters in POST HERE"
        return HttpResponse(json.dumps(context), content_type="application/json")

    topology_name = request.POST['topology_name']
    script_id = request.POST['script_id']
    script_data = request.POST["script_data"]

    try:
        # get the topology by name
        topo = Topology.objects.get(name=topology_name)
        if apiUtils.get_domain_status_for_topology(topo.id) != "running":
            context["status"] = "unknown"
            context["message"] = "Not all domains are running"
            return HttpResponse(json.dumps(context), content_type="application/json")

        raw_json = json.loads(topo.json)
        for obj in raw_json:
            if obj["type"] == "draw2d.shape.node.topologyIcon":
                ip = obj["userData"]["ip"]
                password = obj["userData"]["password"]
                image_type = obj["userData"]["type"]
                mgmt_interface = obj["userData"]["mgmtInterface"]
                hostname = obj["userData"]["label"]

                domain_name = "t%s_%s" % (topo.id, hostname)

                if image_type == "linux":
                    # preconfigure the instance using the console
                    # this will set the management IP, hostname, etc
                    try:
                        consoleUtils.preconfig_linux_domain(domain_name, hostname, password, ip, mgmt_interface)
                        time.sleep(1)

                        # if given a script, let's copy it to the host and run it with the specified script data
                        if script_id != 0:
                            script = Script.objects.get(pk=script_id)
                            # push the
                            linuxUtils.push_remote_script(ip, "root", password, script.script, script.destination)
                            output = linuxUtils.execute_cli(ip, "root", password, script.destination + " " + script_data)
                            print output
                    except Exception as e:
                        print "Could not configure domain: %s" % e
                        context["status"] = "unknown"
                        context["message"] = "Could not configure domain: %s " % e
                        return HttpResponse(json.dumps(context), content_type="application/json")

                elif image_type == "junos":
                    consoleUtils.preconfig_junos_domain(domain_name, password, ip, mgmt_interface)
                else:
                    print "Skipping unknown object"

        context["status"] = "configured"
        context["message"] = "All sandbox nodes configured"
        return HttpResponse(json.dumps(context), content_type="application/json")

    except ObjectDoesNotExist:
        context["status"] = "unknown"
        context["message"] = "Sandbox doesn't exist!"
        return HttpResponse(json.dumps(context), content_type="application/json")


def delete_topology(request):
    context = {"status": "unknown"}

    required_fields = set(['topology_name'])
    if not required_fields.issubset(request.POST):
        context["status"] = "unknown"
        context["message"] = "Invalid parameters in POST HERE"
        return HttpResponse(json.dumps(context), content_type="application/json")

    topology_name = request.POST['topology_name']

    try:
        # get the topology by name
        topology = Topology.objects.get(name=topology_name)

    except ObjectDoesNotExist as odne:
        context["status"] = "deleted"
        context["message"] = "topology does not exist"
        return HttpResponse(json.dumps(context), content_type="application/json")

    topology_prefix = "t%s_" % topology.id
    network_list = libvirtUtils.get_networks_for_topology(topology_prefix)
    for network in network_list:
        print "undefining network: " + network["name"]
        libvirtUtils.undefine_network(network["name"])

    domain_list = libvirtUtils.get_domains_for_topology(topology_prefix)
    for domain in domain_list:
        print "undefining domain: " + domain["name"]
        source_file = libvirtUtils.get_image_for_domain(domain["uuid"])
        if libvirtUtils.undefine_domain(domain["uuid"]):
            if source_file is not None:
                osUtils.remove_instance(source_file)

    topology.delete()
    context["status"] = "deleted"
    context["message"] = "topology deleted"
    return HttpResponse(json.dumps(context), content_type="application/json")