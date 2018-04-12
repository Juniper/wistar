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
import time

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse

from ajax import views as av
from api.lib import apiUtils
from common.lib import consoleUtils
from common.lib import libvirtUtils
from common.lib import linuxUtils
from common.lib import osUtils
from common.lib import wistarUtils
from common.lib import imageUtils
from common.lib import openstackUtils
from images.models import Image
from scripts.models import Script
from topologies.models import Topology
from wistar import configuration

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponseRedirect('/topologies/')


def get_topology_inventory(request):
    """
    FIXME - Should only accept JSON input, not url form-encoded
    :param request:
    :return:
    """

    inventory = dict()

    if 'topology_name' not in request.POST:
        logger.error("Invalid parameters in POST!")
        return HttpResponse(json.dumps(inventory), content_type="application/json")

    topology_name = request.POST['topology_name']

    try:
        topology = Topology.objects.get(name=topology_name)

    except ObjectDoesNotExist:
        logger.error("topology with name '%s' does not exist" % topology_name)
        return HttpResponse(json.dumps(inventory), content_type="application/json")

    try:
        logger.debug("Got topology id: " + str(topology.id))

        raw_json = json.loads(topology.json)
        for json_object in raw_json:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                ud = json_object["userData"]

                if "parentName" not in ud:
                    # child VMs will have a parentName attribute
                    # let's skip them for ansible purposes
                    name = ud.get('name', 'no name')
                    ip = ud.get('ip', '0.0.0.0')
                    username = ud.get('username', 'root')
                    inventory[name] = {"ansible_host": ip, "ansible_user": username}

        return HttpResponse(json.dumps(inventory), content_type="application/json")

    except Exception as ex:
        logger.error(str(ex))
        return HttpResponse(json.dumps(inventory), content_type="application/json")


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

        logger.debug("Got topo " + str(topology.id))
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
        for json_object in raw_json:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                ud = json_object["userData"]
                image_type = ud["type"]
                domain_name = domain_prefix + ud["label"]
                if image_type == "linux":
                    if not consoleUtils.is_linux_device_at_prompt(domain_name):
                        logger.debug("%s does not have a console ready" % domain_name)
                        context["message"] = "not all instances have a console ready"
                        return HttpResponse(json.dumps(context), content_type="application/json")
                        # FIXME - add junos support here

        context["console-status"] = "ready"

        for json_object in raw_json:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                ud = json_object["userData"]
                ip = ud["ip"]
                if not osUtils.check_ip(ip):
                    context["message"] = "not all instances have a management IP"
                    return HttpResponse(json.dumps(context), content_type="application/json")

        context["configured-status"] = "ready"

        context["status"] = "ready"
        context["message"] = "Sandbox is fully booted and available"
        return HttpResponse(json.dumps(context), content_type="application/json")

    except Exception as ex:
        logger.debug(str(ex))
        context["message"] = "Caught Exception!"
        return HttpResponse(json.dumps(context), content_type="application/json")


def start_topology_old(request):
    """
        DEPRECATED
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
        all_used_ips = wistarUtils.get_used_ips()
        logger.debug(str(all_used_ips))

        raw_json = json.loads(topology.json)
        for json_object in raw_json:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                ud = json_object["userData"]
                ip = ud["ip"]
                ip_octets = ip.split('.')
                # get the next available ip
                next_ip = wistarUtils.get_next_ip(all_used_ips, 2)
                # mark it as used so it won't appear in the next iteration
                all_used_ips.append(next_ip)

                ip_octets[3] = str(next_ip)
                newIp = ".".join(ip_octets)
                ud["ip"] = newIp

                ud["configScriptId"] = script_id
                ud["configScriptParam"] = script_param

        description = "Clone from: %s\nScript Id: %s\nScript Param: %s" % (clone_id, script_id, script_param)
        topo = Topology(name=topology_name, description=description, json=json.dumps(raw_json))
        topo.save()

    try:

        # by this point, the topology already exists
        logger.debug("Got topo " + str(topo.id))
        domain_status = libvirtUtils.get_domains_for_topology("t" + str(topo.id) + "_")

        if len(domain_status) == 0:
            # it has not yet been deployed!
            logger.debug("not yet deployed!")

            # let's parse the json and convert to simple lists and dicts
            config = wistarUtils.load_config_from_topology_json(topo.json, topo.id)

            logger.debug("Deploying to hypervisor now")
            # FIXME - should this be pushed into another module?
            av.inline_deploy_topology(config)
            time.sleep(1)

    except Exception as e:
        logger.debug(str(e))
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

        logger.debug("returning")
        return HttpResponse(json.dumps(context), content_type="application/json")

    except Exception as ex:
        logger.debug(str(ex))
        context["status"] = "unknown"
        context["message"] = "Caught Exception %s" % ex
        return HttpResponse(json.dumps(context), content_type="application/json")


def configure_topology(request):
    """
        DEPRECATED
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
            if "userData" in obj and "wistarVm" in obj["userData"]:
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
                            output = linuxUtils.execute_cli(ip, "root", password,
                                                            script.destination + " " + script_data)
                            logger.debug(output)
                    except Exception as e:
                        logger.debug("Could not configure domain: %s" % e)
                        context["status"] = "unknown"
                        context["message"] = "Could not configure domain: %s " % e
                        return HttpResponse(json.dumps(context), content_type="application/json")

                elif image_type == "junos":
                    consoleUtils.preconfig_junos_domain(domain_name, password, ip, mgmt_interface)
                else:
                    logger.debug("Skipping unknown object")

        context["status"] = "configured"
        context["message"] = "All sandbox nodes configured"
        return HttpResponse(json.dumps(context), content_type="application/json")

    except ObjectDoesNotExist:
        context["status"] = "unknown"
        context["message"] = "Sandbox doesn't exist!"
        return HttpResponse(json.dumps(context), content_type="application/json")


def delete_topology(request):
    """
    DEPRECATED
    :param request:
    :return:
    """

    logger.debug("---- delete_topology ----")
    json_string = request.body
    json_body = json.loads(json_string)

    required_fields = set(['name'])
    if not required_fields.issubset(json_body[0]):
        logger.error("Invalid parameters in json body")
        return HttpResponse(status=500)

    topology_name = json_body[0]["name"]

    try:
        # get the topology by name
        topology = Topology.objects.get(name=topology_name)

    except ObjectDoesNotExist:
        return apiUtils.return_json(False, "Topology is already deleted or does not exist")

    try:
        topology_prefix = "t%s_" % topology.id
        network_list = libvirtUtils.get_networks_for_topology(topology_prefix)
        for network in network_list:
            logger.debug("undefining network: " + network["name"])
            libvirtUtils.undefine_network(network["name"])

        domain_list = libvirtUtils.get_domains_for_topology(topology_prefix)
        for domain in domain_list:
            logger.debug("undefining domain: " + domain["name"])
            source_file = libvirtUtils.get_image_for_domain(domain["uuid"])
            if libvirtUtils.undefine_domain(domain["uuid"]):
                if source_file is not None:
                    osUtils.remove_instance(source_file)

            # remove reserved mac addresses for all domains in this topology
            mac_address = libvirtUtils.get_management_interface_mac_for_domain(domain["name"])
            libvirtUtils.release_management_ip_for_mac(mac_address)

        topology.delete()
        return apiUtils.return_json(True, "Topology deleted!")

    except Exception as e:
        logger.error(str(e))
        return HttpResponse(status=500)


def import_topology_json(request):

    logger.debug("---- import_topology_json ----")
    json_string = request.body

    # fixme - add some basic check to ensure we have the proper format here

    topology_json_string = wistarUtils.clone_topology(json_string)
    if topology_json_string is None:
        return apiUtils.return_json(False, "Topology Import Failed!")

    try:
        topology_json = json.loads(topology_json_string)
    except ValueError as ve:
        logger.error('Could not parse topology json from Clone!')
        return apiUtils.return_json(False, "Topology Import Failed!")

    try:
        for json_object in topology_json:
            if json_object["type"] == "wistar.info":
                name = json_object["name"]
                description = json_object["description"]
                break

        if Topology.objects.filter(name=name).exists():
            logger.info('Not importing existing topology with this name!')
            return apiUtils.return_json(True, "Topology Exists with name: %s" % name)

        logger.debug("Creating new topology with name: %s" % name)
        t = Topology(name=name, description=description, json=topology_json_string)
        t.save()

        return apiUtils.return_json(True, "Topology Imported with id: %s" % t.id, topology_id=t.id)

    except Exception as e:
        logger.error(e)
        return apiUtils.return_json(False, "Topology Import Failed!")


def check_topology_exists(request):
    logger.debug("---- check_topology_exists ----")

    json_string = request.body
    json_body = json.loads(json_string)

    try:
        if "name" in json_body[0]:
            topology_name = json_body[0]["name"]
            try:
                # get the topology by name
                topology = Topology.objects.get(name=topology_name)
                return apiUtils.return_json(True, "Topology Already Exists with id: %s" % topology.id,
                                            topology_id=topology.id)

            except Topology.DoesNotExist:
                return apiUtils.return_json(False, 'Topology Does not Exist')

        else:
            return apiUtils.return_json(False, "Malformed input data")
    except Exception as e:
        logger.error(e)
        return apiUtils.return_json(False, "Unknown Error checking topology!")


def export_topology_json(request):

    logger.debug('---- export_topology_json ----')
    json_string = request.body
    json_body = json.loads(json_string)

    if "name" in json_body[0]:
        topology_name = json_body[0]["name"]
        try:
            # get the topology by name
            topology = Topology.objects.get(name=topology_name)
            json_data = json.loads(topology.json)
            info_data = dict()
            info_data["type"] = "wistar.info"
            info_data["name"] = topology.name
            info_data["description"] = topology.description
            info_data["topology_id"] = topology.id
            json_data.append(info_data)
            return HttpResponse(json.dumps(json_data), content_type="application/json")

        except Topology.DoesNotExist:
            logger.error('Topology with name: %s does not exist' % topology_name)
            return HttpResponse(status=500)
        except ValueError:
            logger.error('Could not parse JSON object from saved topology!')
            return HttpResponse(status=500)


def start_topology(request):
    logger.debug("---- start_topology ---- ")
    json_string = request.body

    try:
        json_body = json.loads(json_string)
    except ValueError:
        return apiUtils(False, "Could not load json payload")

    try:
        if "name" in json_body[0]:
            topology_name = json_body[0]["name"]

            # do we have a specified delay between starting domains?
            if 'start_delay' in json_body[0]:
                delay = int(json_body[0]['start_delay'])
            else:
                delay = 0.5

            # get the topology by name
            try:
                topology = Topology.objects.get(name=topology_name)
            except ObjectDoesNotExist:
                logger.error('Could not find topology with name: %s' % topology_name)
                return apiUtils(False, "Could not find topology with name: %s" % topology_name)

            domain_list = libvirtUtils.get_domains_for_topology("t" + str(topology.id) + "_")

            if len(domain_list) == 0:
                # it has not yet been deployed!
                logger.debug("not yet deployed!")

                # let's parse the json and convert to simple lists and dicts
                config = wistarUtils.load_config_from_topology_json(topology.json, topology.id)

                if config is None:
                    return apiUtils(False, "Could not load config for topology: %s" % topology.id)

                logger.debug("Deploying to hypervisor now")

                # FIXME - should this be pushed into another module?
                av.inline_deploy_topology(config)

            # now, topology should be deployed and ready to go!
            network_list = libvirtUtils.get_networks_for_topology("t" + str(topology.id) + "_")
            domain_list = libvirtUtils.get_domains_for_topology("t" + str(topology.id) + "_")

            for network in network_list:
                logger.debug("starting network: %s" % network["name"])
                libvirtUtils.start_network(network["name"])

            time.sleep(delay)
            for domain in domain_list:
                # no sleep time? Just go ahead and melt the disks!
                if domain["state"] != 'running':
                    logger.debug("starting domain: %s" % domain["uuid"])
                    libvirtUtils.start_domain(domain["uuid"])
                    time.sleep(delay)

            return apiUtils.return_json(True, 'Topology started!', topology_id=topology.id)

    except Exception as ex:
        logger.debug(str(ex))
        return apiUtils.return_json(False, 'Could not start topology!')


def check_image_exists(request):
    """
    Checks if an image already exists in Wistar

    :param request: JSON payload that contains a single object with the following properties: name
    :return: a JSON object with at least the following properties: status (boolean), message, and other properties
        may also return an HTTP Status of 500 in case of exceptions
    """
    logger.debug("---- check_image_exists ----")

    json_string = request.body
    json_body = json.loads(json_string)

    try:
        if "name" in json_body[0]:
            image_name = json_body[0]["name"]
            image_list = imageUtils.get_image_list()
            found = False
            image_id = 0
            for image in image_list:
                if "file" in image and image_name in image["file"]:
                    image_id = image["id"]
                    found = True
                    break

            if found:
                return apiUtils.return_json(True, "Image was found with id: %s" % image_id, image_id=image_id)
            else:
                return apiUtils.return_json(False, "Image was not found!")

        else:
            return apiUtils.return_json(False, "Malformed input data")
    except Exception as e:
        logger.error(e)
        return apiUtils.return_json(False, "Unknown Error checking image!")


def create_local_image(request):
    """
    Creates an image from a file on the local filesystem. You should upload the image to the server first, then call
    this to register that image with Wistar!

    :param request: JSON payload that contains a single object with the following properties:
        name, description, image_type, and file_name
    :return: a JSON object with at least the following properties: status (boolean), message, and other properties
        may also return an HTTP Status of 500 in case of exceptions
    """
    logger.debug("---- create_local_image ----")
    json_string = request.body
    try:
        json_body = json.loads(json_string)
    except ValueError as ve:
        logger.error('Could not parse json payload!')
        return apiUtils.return_json(False, "Could not parse json payload!")

    logger.debug(json_body)
    required_fields = set(['name', 'description', 'image_type', 'file_name'])
    if not required_fields.issubset(json_body[0]):
        logger.error("Invalid parameters in json body")
        return apiUtils.return_json(False, "Invalid parameters in json payload")

    file_name = json_body[0]["file_name"]
    name = json_body[0]["name"]
    description = json_body[0]["description"]
    image_type = json_body[0]["image_type"]

    file_path = configuration.user_images_dir + "/" + file_name
    try:
        image_id = imageUtils.create_local_image(name, description, file_path, image_type)
        return apiUtils.return_json(True, "Image Exists with id: %s" % image_id, image_id=image_id)

    except Exception as e:
        logger.error(str(e))
        return apiUtils.return_json(False, "Unknown exception in create_local_image")
        # return apiUtils.return_json(False, "Could not create local image!")


def delete_image(request):
    """
    Deletes an image from Wistar

    :param request: JSON payload that contains a single object with the following properties:  name
    :return: a JSON object with at least the following properties: status (boolean) and message
    """
    logger.debug("---- delete_image ----")
    json_string = request.body
    json_body = json.loads(json_string)

    required_fields = set(['name'])
    if not required_fields.issubset(json_body[0]):
        logger.error("Invalid parameters in json body")
        return HttpResponse(status=500)

    name = json_body[0]["name"]

    imageUtils.delete_image_by_name(name)
    return apiUtils.return_json(True, "Image deleted")


def import_glance_image(request):
    """
        Imports Openstack Glance image into Wistar.

        :param request: JSON payload that contains a single object with the following properties:
            image_name, image_type, image_descr
        :return: a JSON object with at least the following properties: status (boolean) and message
        """

    logger.debug("<---- API call import_glance_images ---->")

    if openstackUtils.connect_to_openstack():

        json_string = request.body

        try:
            json_body = json.loads(json_string)
        except ValueError as ve:
            logger.error('Could not parse json payload with error <{0}>'.format(ve.message))
            return apiUtils.return_json(False, "Could not parse json payload!")

        logger.debug(json_body)
        required_fields = {'image_name', 'image_type', 'image_descr'}

        if not required_fields.issubset(json_body):
            logger.error("Invalid parameters in json body")
            return apiUtils.return_json(False, "Invalid parameters in json payload")

        image_name = json_body["image_name"]
        image_type = json_body["image_type"]
        image_decr = json_body["image_descr"]

        logger.debug("<---- API call import_glance_image: <{0}> START ---->".format(image_name))

        if Image.objects.filter(name=image_name).exists():
            logger.info('image with name %s already exists' % image_name)
            return apiUtils.return_json(True, "Glance images already imported")

        image = Image()
        image.description = image_decr + ' image imported from Glance'
        image.name = image_name
        image.type = image_type
        image.save()
        logger.debug("<---- API call import_glance_image: <{0}> DONE ---->".format(image_name))

        return apiUtils.return_json(True, "Glance images successfully imported")

    else:
        return apiUtils.return_json(False, "Failed to authenticate")