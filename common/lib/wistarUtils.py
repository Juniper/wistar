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
import math
import os
import re
import subprocess
import time

from django.core.exceptions import ObjectDoesNotExist

import imageUtils
import libvirtUtils
import openstackUtils
import osUtils
from images.models import Image
from scripts.models import Script
from topologies.models import Topology
from wistar import configuration
from wistar import settings

logger = logging.getLogger(__name__)
# keep track of how many mac's we've used
mac_counter = 0

# keep track of all macs that been used
used_macs = dict()


def generate_next_mac(topology_id):
    """
    keep track of all used macs and don't reuse them if possible
    :param topology_id: id of the topology in question
    :return: unique mac
    """

    if configuration.deployment_backend == 'openstack':
        # we just don't need this for openstack at all, just return a string that will
        # never get used
        return '52:54:11:22:33:44'

    global used_macs
    if topology_id not in used_macs:
        used_macs[topology_id] = list()

    macs_for_topology = used_macs[topology_id]
    mac = _generate_mac(topology_id)

    while mac in macs_for_topology:
        logger.info('this mac %s has already been used!' % mac)
        mac = _generate_mac(topology_id)

    macs_for_topology.append(mac)
    return mac


def _generate_mac(topology_id):
    """
    silly attempt to keep mac addresses unique
    use the topology id to generate 2 octets, and the number of
    macs used so far to generate the last two octets.
    Uses the locally administered address ranges 52:54:00 through 52:54:FF
    :param topology_id: string id of the topology we are building
    :return: mostly unique mac address that should be safe to deploy
    """
    tid = int(topology_id)
    global mac_counter
    global used_macs
    base = '52:54:00:00:00:00'
    ba = base.split(':')
    ba[2] = '%02x' % int(tid / 256)
    ba[3] = '%02x' % int(tid % 256)
    ba[4] = '%02x' % int(len(used_macs[topology_id]) / 256)
    ba[5] = '%02x' % int(mac_counter)

    mac_counter += 1

    mac_counter = mac_counter % 256
    return ':'.join(ba)


def get_heat_json_from_topology_config(config, project_name='admin'):
    """
    Generates heat template from the topology configuration object
    use load_config_from_topology_json to get the configuration from the Topology
    :param config: configuration dict from load_config_from_topology_json
    :return: json encoded heat template as String
    """

    template = dict()
    template["heat_template_version"] = "2013-05-23"
    template["resources"] = dict()

    for network in config["networks"]:
        nr = dict()
        nr["type"] = "OS::Neutron::Net"

        nrp = dict()
        nrp["shared"] = False
        nrp["name"] = network["name"]
        nrp["admin_state_up"] = True

        nr["properties"] = nrp

        nrs = dict()
        nrs["type"] = "OS::Neutron::Subnet"
        #
        p = dict()
        p["cidr"] = "1.1.1.0/24"
        p["enable_dhcp"] = False
        p["gateway_ip"] = ""
        p["name"] = network["name"] + "_subnet"
        if network["name"] == "virbr0":
            p["network_id"] = configuration.openstack_mgmt_network
        elif network["name"] == configuration.openstack_external_network:
            p["network_id"] = configuration.openstack_external_network
        else:
            p["network_id"] = {"get_resource": network["name"]}

        nrs["properties"] = p

        template["resources"][network["name"]] = nr
        template["resources"][network["name"] + "_subnet"] = nrs

    # cache the image_details here to avoid multiple REST calls for details about an image type
    # as many topologies have lots of the same types of images around
    image_details_dict = dict()

    for device in config["devices"]:

        if device["imageId"] in image_details_dict:
            image_details = image_details_dict[device["imageId"]]
        else:
            image_details = imageUtils.get_image_detail(device["imageId"])
            image_details_dict[device["imageId"]] = image_details

        image_name = image_details["name"]

        image_disk_size = 20

        # set the size in GB, rounding up to the nearest int
        if 'size' in image_details:
            current_size = int(image_details['size'])
            image_disk_size = int(math.ceil(current_size / 100000000))

        # if the flavor asks for a minimum disk size, let's see if it's larger that what we have
        if "min_disk" in image_details and image_details['min_disk'] > image_disk_size:
            image_disk_size = image_details["min_disk"]

        # if the user has specified a desired disk size, grab it here so we get the correct flavor
        if type(image_disk_size) is int and device["resizeImage"] > image_disk_size:
            image_disk_size = device["resizeImage"]

        # determine openstack flavor here
        device_ram = int(device["ram"])
        device_cpu = int(device["cpu"])

        flavor_detail = openstackUtils.get_minimum_flavor_for_specs(configuration.openstack_project,
                                                                    device_cpu,
                                                                    device_ram,
                                                                    image_disk_size
                                                                    )

        flavor = flavor_detail["name"]

        dr = dict()
        dr["type"] = "OS::Nova::Server"
        dr["properties"] = dict()
        dr["properties"]["flavor"] = flavor
        dr["properties"]["networks"] = []
        index = 0
        for p in device["interfaces"]:
            port = dict()
            port["port"] = dict()
            port["port"]["get_resource"] = device["name"] + "_port" + str(index)
            index += 1
            dr["properties"]["networks"].append(port)

        dr["properties"]["image"] = image_name
        dr["properties"]["name"] = device["name"]

        if device["configDriveSupport"]:
            dr["properties"]["config_drive"] = True
            dr["properties"]["user_data_format"] = "RAW"
            metadata = dict()
            metadata["hostname"] = device["name"]
            metadata["console"] = "vidconsole"
            dr["properties"]["metadata"] = metadata

            # let's check all the configDriveParams and look for a junos config
            # FIXME - this may need tweaked if we need to include config drive cloud-init support for other platforms
            # right now we just need to ignore /boot/loader.conf
            for cfp in device["configDriveParams"]:

                if "destination" in cfp and cfp["destination"] == "/boot/loader.conf":
                    logger.debug("Creating loader.conf config-drive entry")
                    template_name = cfp["template"]
                    loader_string = osUtils.compile_config_drive_params_template(template_name,
                                                                                 device["name"],
                                                                                 device["label"],
                                                                                 device["password"],
                                                                                 device["ip"],
                                                                                 device["managementInterface"])

                    logger.debug('----------')
                    logger.debug(loader_string)
                    logger.debug('----------')
                    for l in loader_string.split('\n'):
                        if '=' in l:
                            left, right = l.split('=')
                            if left not in metadata and left != '':
                                metadata[left] = right.replace('"', '')

                if "destination" in cfp and cfp["destination"] == "/juniper.conf":
                    logger.debug("Creating juniper.conf config-drive entry")
                    template_name = cfp["template"]
                    personality_string = osUtils.compile_config_drive_params_template(template_name,
                                                                                      device["name"],
                                                                                      device["label"],
                                                                                      device["password"],
                                                                                      device["ip"],
                                                                                      device["managementInterface"])

                    dr["properties"]["personality"] = dict()
                    dr["properties"]["personality"] = {"/config/juniper.conf": personality_string}
                else:
                    logger.debug('No juniper.conf found here ')

        if device['cloudInitSupport']:
            logger.debug('creating cloud-init script')
            dr["properties"]["config_drive"] = True
            dr["properties"]["user_data_format"] = "RAW"
            metadata = dict()
            metadata["hostname"] = device["name"]
            dr["properties"]["metadata"] = metadata
            # grab the prefix len from the management subnet which is in the form 192.168.122.0/24
            if '/' in configuration.management_subnet:
                management_prefix_len = configuration.management_subnet.split('/')[1]
            else:
                management_prefix_len = '24'

            management_ip = device['ip'] + '/' + management_prefix_len

            device_config = osUtils.get_cloud_init_config(device['name'],
                                                          device['label'],
                                                          management_ip,
                                                          device['managementInterface'],
                                                          device['password'])

            script_string = ""
            if "configScriptId" in device and device["configScriptId"] != 0:
                logger.debug("Passing script data!")
                try:
                    script = Script.objects.get(pk=int(device["configScriptId"]))
                    script_string = script.script
                    device_config["script_param"] = device.get("configScriptParam", '')
                    logger.debug(script_string)
                except ObjectDoesNotExist:
                    logger.info('config script was specified but was not found!')

            user_data_string = osUtils.render_cloud_init_user_data(device_config, script_string)
            dr["properties"]["user_data"] = user_data_string

        template["resources"][device["name"]] = dr

    for device in config["devices"]:
        index = 0
        for port in device["interfaces"]:
            pr = dict()
            pr["type"] = "OS::Neutron::Port"
            p = dict()

            if port["bridge"] == "virbr0":
                p["network_id"] = configuration.openstack_mgmt_network

                # specify our desired IP address on the management interface
                p['fixed_ips'] = list()
                fip = dict()
                fip['ip_address'] = device['ip']
                p['fixed_ips'].append(fip)

            elif port["bridge"] == configuration.openstack_external_network:
                p["network_id"] = configuration.openstack_external_network
            else:
                p["network_id"] = {"get_resource": port["bridge"]}
                # disable port security on all other ports (in case this isn't set globally)
                p['port_security_enabled'] = False

            pr["properties"] = p
            template["resources"][device["name"] + "_port" + str(index)] = pr
            index += 1

    return json.dumps(template)


def _get_management_macs_for_topology(topology_id):
    """
    returns a list of all macs used for management interfaces for a topology
    :param topology_id: id of the topology
    :return: list of macs
    """
    existing_macs = list()

    domains = libvirtUtils.get_domains_for_topology(topology_id)
    for d in domains:
        m = libvirtUtils.get_management_interface_mac_for_domain(d['name'])
        logger.debug('adding existing mac %s to existing_macs list' % m)
        existing_macs.append(m)

    return existing_macs


def load_config_from_topology_json(topology_json, topology_id):
    """
    Generates dict containing a list of devices and networks from the topology JSON
        config["devices"]
        config["networks"]

    :param topology_json: json from the stored Topology object
    :param topology_id: id of the topology from the db
    :return: dict containing list of devices and networks
    """
    logger.debug("loading json object from topology: %s" % topology_id)
    global mac_counter
    mac_counter = 0

    # preload all the existing management mac addresses if any
    global used_macs
    if configuration.deployment_backend == "kvm":
        used_macs[topology_id] = _get_management_macs_for_topology(topology_id)
    else:
        used_macs[topology_id] = list()

    json_data = json.loads(topology_json)

    # configuration json will consist of a list of devices and networks
    # iterate through the topology_json and construct the appropriate device and network objects
    # and each to the appropriate list
    devices = []
    networks = []

    # allow multiple external bridges
    external_bridges = dict()
    # allow multiple internal bridges
    internal_bridges = []

    device_index = 0
    chassis_name_to_index = dict()

    # has this topology already been deployed?
    is_deployed = False
    if len(used_macs[topology_id]) > 0:
        # yep, already been deployed
        is_deployed = True

    for json_object in json_data:
        if "userData" in json_object and "wistarVm" in json_object["userData"]:
            user_data = json_object["userData"]
            logger.debug("Found a topology vm")
            device = dict()

            device["name"] = "t" + str(topology_id) + "_" + user_data.get("name", "")
            device["label"] = user_data.get("name", "")
            device["imageId"] = user_data.get("image", "")

            try:
                Image.objects.get(pk=device["imageId"])
            except ObjectDoesNotExist:
                raise Exception("Not all images are present!")

            logger.debug(json_object)

            device["ram"] = user_data.get("ram", 1024)
            device["cpu"] = user_data.get("cpu", 1)
            device["interfacePrefix"] = user_data.get("interfacePrefix", "")
            device["configurationFile"] = user_data.get("configurationFile", "")

            try:
                device["slot_offset"] = int(user_data.get("pciSlotOffset", 3))
            except ValueError:
                logger.warn("Could not parse int from pciSlotOffset")
                device["slot_offset"] = 3

            device["interfaceType"] = user_data.get("interfaceType", "")

            device["smbiosProduct"] = user_data.get("smbiosProductString", "")
            device["smbiosManufacturer"] = user_data.get("smbiosManufacturer", "")
            device["smbiosVersion"] = user_data.get("smbiosVersion", "")

            device["secondaryDiskParams"] = user_data.get("secondaryDiskParams", [])
            device["tertiaryDiskParams"] = user_data.get("tertiaryDiskParams", [])

            device["managementInterface"] = user_data.get("mgmtInterface", "")

            try:
                device["resizeImage"] = int(user_data.get("resize", 0))
            except ValueError:
                logger.warn("couldn't parse int from resizeImage value!")
                device["resizeImage"] = 0

            device["ip"] = user_data.get("ip", "")
            device["type"] = user_data.get("type", "")

            device["user"] = "root"
            if "user" in user_data:
                device["user"] = user_data.get("user", "")

            device["password"] = user_data.get("password", "")

            device["companionInterfaceMirror"] = user_data.get("companionInterfaceMirror", "")
            device["companionInterfaceMirrorOffset"] = user_data.get("companionInterfaceMirrorOffset", "")
            device["mirroredInterfaces"] = []

            device["configScriptId"] = 0
            device["configScriptParam"] = 0

            if "cloudInitSupport" in user_data:
                device["cloudInitSupport"] = user_data.get("cloudInitSupport", False)

            device["configDriveSupport"] = False

            if "configDriveSupport" in user_data:
                device["configDriveSupport"] = user_data.get("configDriveSupport", "")
                if "configDriveParams" in user_data:
                    device["configDriveParams"] = user_data.get("configDriveParams", "")
                    device["configDriveParamsFile"] = user_data.get("configDriveParamsFile", "")
                else:
                    device["configDriveParams"] = list()

            if "configScriptId" in user_data:
                logger.debug("Found a configScript to use!")
                device["configScriptId"] = user_data.get("configScriptId", "")
                device["configScriptParam"] = user_data.get("configScriptParam", "")

            device["uuid"] = json_object.get('id', '')
            device["interfaces"] = []

            device['vncPort'] = 0
            if configuration.deployment_backend == "kvm":
                # determine next available VNC port that has not currently been assigned
                next_vnc_port = libvirtUtils.get_next_domain_vnc_port(device_index)

                # verify that this port is not actually in use by another process
                while osUtils.check_port_in_use(next_vnc_port):
                    device_index += 1
                    next_vnc_port = libvirtUtils.get_next_domain_vnc_port(device_index)

                device["vncPort"] = next_vnc_port

            # is this a child VM?
            # children will *always* have a parent attribute set in their userdata
            parent_id = user_data.get("parent", "")
            logger.debug("Found parent_id of: %s for device: %s" % (parent_id, device["name"]))
            if parent_id == "":
                logger.debug("setting isChild to False")
                device["isChild"] = False
            else:
                logger.debug("setting isChild to True")

                device["isChild"] = True

            # use chassis name as the naming convention for all the bridges
            # we'll create networks as 'topology_id + _ + chassis_name + function
            # i.e. t1_vmx01_c and t1_vmx01_c
            chassis_name = user_data.get("name", "")
            if "parentName" in user_data:
                chassis_name = user_data.get("parentName", "")

            if "parent" in user_data:
                device["parent"] = user_data.get("parent", "")

            logger.debug("Using chassis name of: %s" % chassis_name)

            if chassis_name in chassis_name_to_index:
                chassis_id = chassis_name_to_index[chassis_name]
            else:
                chassis_id = device_index
                chassis_name_to_index[chassis_name] = chassis_id

            # set this property for use later, we'll loop again after we have configured all the connections
            # to create the management interface at the end (i.e. for Linux hosts)
            device["mgmtInterfaceIndex"] = user_data.get("mgmtInterfaceIndex", 0)

            # now let's create the interfaces declared so far
            if device["mgmtInterfaceIndex"] != -1:
                device_interface_wiring = dict()

                # setup management interface
                # management interface mi will always be connected to default management network (virbr0 on KVM)
                mi = dict()

                # slight optimization for kvm backend, dont generate new mac
                if configuration.deployment_backend == "kvm" and \
                        is_deployed and \
                        libvirtUtils.domain_exists(device['name']):
                    mi['mac'] = libvirtUtils.get_management_interface_mac_for_domain(device['name'])
                else:
                    mi['mac'] = generate_next_mac(topology_id)

                mi["bridge"] = "virbr0"
                mi["type"] = user_data.get("mgmtInterfaceType", "virtio")

                device_interface_wiring[device["mgmtInterfaceIndex"]] = mi

                for dummy in user_data.get("dummyInterfaceList", []):
                    dm = dict()
                    dm["mac"] = generate_next_mac(topology_id)
                    dm["bridge"] = "t%s_d" % str(topology_id)
                    dm["type"] = user_data.get("mgmtInterfaceType", "")

                    device_interface_wiring[dummy] = dm

                for companion in user_data.get("companionInterfaceList", []):
                    cm = dict()
                    cm["mac"] = generate_next_mac(topology_id)
                    cm["bridge"] = "t%s_%s_c" % (str(topology_id), chassis_id)
                    cm["type"] = user_data.get("interfaceType", "virtio")

                    device_interface_wiring[companion] = cm

                # we do have management interfaces first, so let's go ahead and add them to the device
                # THIS ASSUMES THE JSON CONFIGURATION IS VALID! I.E. all interface indexes are accounted for
                # 0, 1, 2, 3 etc.
                interfaces = device_interface_wiring.keys()
                interfaces.sort()

                for interface in interfaces:
                    interface_config = device_interface_wiring[interface]
                    interface_config["slot"] = "%#04x" % int(len(device["interfaces"]) + device["slot_offset"])
                    device["interfaces"].append(interface_config)

                    # let's check if we've already set this bridge to be created
                    found = False
                    for network in networks:
                        if network["name"] == interface_config["bridge"]:
                            found = True
                            break

                    # let's go ahead and add this to the networks list if needed
                    if not found and interface_config["bridge"] != "virbr0":
                        nn = dict()
                        nn["name"] = interface_config["bridge"]
                        nn["mac"] = generate_next_mac(topology_id)
                        networks.append(nn)

            device_index += 1
            devices.append(device)

        # this object is not a VM, let's check if it's a cloud/bridge object
        elif json_object["type"] == "draw2d.shape.node.externalCloud":
            if json_object["userData"]["label"] == "External":
                # is this an old topology? manually fix here!
                external_bridges[json_object["id"]] = "br0"
            else:
                # track all external bridges here for later use
                external_bridges[json_object["id"]] = json_object["userData"]["label"]
        elif json_object["type"] == "draw2d.shape.node.internalCloud":
            # track all internal bridges as well
            internal_bridges.append(json_object["id"])

    conn_index = 1

    for json_object in json_data:
        if json_object["type"] == "draw2d.Connection":
            target_uuid = json_object["target"]["node"]
            source_uuid = json_object["source"]["node"]

            # should we create a new bridge for this connection?
            create_bridge = True

            bridge_name = "t" + str(topology_id) + "_br" + str(conn_index)

            for d in devices:
                if d["uuid"] == source_uuid:
                    # slot should always start with 6 (or 5 for vmx phase 2/3)
                    slot = "%#04x" % int(len(d["interfaces"]) + device["slot_offset"])
                    interface = dict()
                    interface["mac"] = generate_next_mac(topology_id)
                    # does this bridge already exist? Possibly external bridge for example
                    # essentially same of create_bridge flag, but kept on the interface for later use in heat template
                    interface["bridge_preexists"] = False

                    if target_uuid in internal_bridges:
                        bridge_name = "t" + str(topology_id) + "_p_br" + str(internal_bridges.index(target_uuid))
                        interface["bridge"] = bridge_name
                    elif target_uuid in external_bridges.keys():
                        bridge_name = external_bridges[target_uuid]
                        interface["bridge"] = bridge_name
                        # do not create external bridges...
                        create_bridge = False
                        interface["bridge_preexists"] = True
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = device["interfacePrefix"] + str(len(d["interfaces"]))
                    interface["linkId"] = json_object["id"]
                    interface["type"] = device["interfaceType"]
                    d["interfaces"].append(interface)

                    # do we need to mirror interfaces up to the parent VM?
                    if d["companionInterfaceMirror"] and "parent" in d:
                        pci_slot_str = "%#04x" % int(len(d["interfaces"]) + d["companionInterfaceMirrorOffset"])
                        em = dict()
                        em["mac"] = generate_next_mac(topology_id)
                        em["bridge"] = bridge_name
                        em["slot"] = pci_slot_str

                        for dd in devices:
                            if dd["uuid"] == d["parent"]:
                                em["type"] = dd["interfaceType"]
                                dd["mirroredInterfaces"].append(em)
                                break

                elif d["uuid"] == target_uuid:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + device["slot_offset"])
                    interface = dict()
                    interface["mac"] = generate_next_mac(topology_id)

                    if source_uuid in internal_bridges:
                        bridge_name = "t" + str(topology_id) + "_p_br" + str(internal_bridges.index(source_uuid))
                        interface["bridge"] = bridge_name
                    if source_uuid in external_bridges.keys():
                        bridge_name = external_bridges[source_uuid]
                        interface["bridge"] = bridge_name
                        create_bridge = False
                        # keep bridge existence information on the interface for use in heat template
                        interface["bridge_preexists"] = True
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = device["interfacePrefix"] + str(len(d["interfaces"]))
                    interface["linkId"] = json_object["id"]
                    interface["type"] = device["interfaceType"]

                    d["interfaces"].append(interface)
                    # do we need to mirror interfaces up to the parent VM?
                    if d["companionInterfaceMirror"] and "parent" in d:
                        pci_slot_str = "%#04x" % int(len(d["interfaces"]) + d["companionInterfaceMirrorOffset"])
                        em = dict()
                        em["mac"] = generate_next_mac(topology_id)
                        em["bridge"] = bridge_name
                        em["slot"] = pci_slot_str

                        for dd in devices:
                            if dd["uuid"] == d["parent"]:
                                em["type"] = dd["interfaceType"]
                                dd["mirroredInterfaces"].append(em)
                                break

            # let's check to see if we've already marked this internal bridge for creation
            for c in networks:
                if c["name"] == bridge_name:
                    logger.debug("Skipping bridge creation for " + bridge_name)
                    create_bridge = False
                    continue

            if create_bridge is True:
                logger.debug("Setting " + bridge_name + " for creation")
                connection = dict()
                connection["name"] = bridge_name
                connection["mac"] = generate_next_mac(topology_id)
                networks.append(connection)
                conn_index += 1

    # now let's add a management interface if it's required
    # if index == -1, then the desire is to put it last!
    for d in devices:
        if d["mgmtInterfaceIndex"] == -1:
            mi = dict()
            # if this has already been deployed, let's preserve the existing mac address that has been assigned
            if configuration.deployment_backend == "kvm" and \
                    is_deployed and \
                    libvirtUtils.domain_exists(device['name']):
                mi['mac'] = libvirtUtils.get_management_interface_mac_for_domain(device['name'])
            else:
                mi['mac'] = generate_next_mac(topology_id)

            mi["slot"] = "%#04x" % int(len(d["interfaces"]) + d["slot_offset"])
            mi["bridge"] = "virbr0"
            mi["type"] = user_data.get("mgmtInterfaceType", "")
            d["interfaces"].append(mi)

    topology_config = dict()
    topology_config["networks"] = networks
    topology_config["devices"] = devices
    return topology_config


def clone_topology(topology_json):
    """
    iterate through topology json and increment
    all found management IPs to provide for some
    small uniqueness protection. The right way to do this
    would be to track all used management ips, but I would rather
    each topology be a transient thing to be used and thrown away
    :param topology_json: json string from Topology
    :return: new topology_json with incremented management IPs
    """
    try:
        json_data = json.loads(topology_json)
    except ValueError as ve:
        logger.error('Could not parse topology JSON for clone!')
        return None

    try:
        all_used_ips = get_used_ips()
        floor_ip = 2

        for json_object in json_data:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                ud = json_object["userData"]
                next_ip = get_next_ip(all_used_ips, floor_ip)
                floor_ip = next_ip
                new_ip = configuration.management_prefix + str(next_ip)
                logger.debug("new_ip is " + new_ip)
                ud["ip"] = new_ip

                # verify the correct image id and type - useful when importing from another source or wistar instance!
                try:
                    image = Image.objects.get(id=ud["image"])
                    if image.type != ud["type"]:
                        raise Image.DoesNotExist

                except Image.DoesNotExist as dne:
                    image_list = Image.objects.filter(type=ud["type"])
                    if len(image_list) == 0:
                        # nope, bail out and let the user know what happened!
                        logger.error("Could not find image of type " + ud["type"])
                    else:
                        image = image_list[0]
                        logger.debug("Updating image to corrected id of: %s " % str(image.id))
                        json_object["userData"]["image"] = image.id

                # do not import configuration script information if the id does not exist here
                # for non-local clone operations, this could pose a problem
                if "configScriptId" in ud:
                    if not Script.objects.filter(id=ud['configScriptId']).exists():
                        logger.info('Could not find desired script during clone')
                        json_object['userData']['configScriptId'] = 0

        return json.dumps(json_data)

    except Exception as e:
        logger.debug(str(e))
        return None


def launch_web_socket(vnc_port, web_socket_port, server):
    """
    Launch a new websockify session to connect spice terminal to VNC port of VMs
    :param vnc_port: vnc port to connect to
    :param web_socket_port: web socket port to connect from
    :param server: server to redirect to
    :return: pid of the websockify process
    """

    path = os.path.abspath(os.path.dirname(__file__))
    ws = os.path.join(path, "../../webConsole/bin/websockify.py")

    web_socket_path = os.path.abspath(ws)

    cmd = "%s %s:%s %s:%s --idle-timeout=120 &" % (web_socket_path, server, vnc_port, server, web_socket_port)

    logger.debug(cmd)

    proc = subprocess.Popen(cmd, shell=True, close_fds=True)
    time.sleep(1)
    return proc.pid


def launch_proxy(local_port, remote_port, remote_ip):
    """
    Launch a new wistar_proxy process to enable access to internal VMs / containers
    :param local_port: port on the wistar server to listen on
    :param remote_port: port on the far side to proxy towards
    :param remote_ip: ip address to proxy towards
    :return: process id of the spawned process
    """

    path = os.path.abspath(os.path.dirname(__file__))
    ws = os.path.join(path, "../../proxy/bin/wistar_proxy.py")

    wistar_proxy_path = os.path.abspath(ws)

    cmd = "/usr/bin/env python %s --local-port=%s --remote-ip=%s --remote-port=%s &" % (wistar_proxy_path,
                                                                    local_port,
                                                                    remote_ip,
                                                                    remote_port)

    logger.debug(cmd)

    proc = subprocess.Popen(cmd, shell=True, close_fds=True)
    time.sleep(1)
    return proc.pid


def check_pid(pid):
    """
    Check For the existence of a unix pid.
        shamelessly taken from stackoverflow
        http://stackoverflow.com/questions/568271/how-to-check-if-there-exists-a-process-with-a-given-pid
    :param pid: process id of the process in question
    :return: boolean
    """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True


def check_web_socket(server, web_socket_port):
    """
    Verify if websockify process already exists for given service address and websocket port
    :param server: address of server
    :param web_socket_port: web socket port
    :return: boolean
    """
    rt = os.system('ps -ef | grep "websockify.py ' + server + ':' + web_socket_port + '" | grep -v grep')
    if rt == 0:
        return True
    else:
        return False


def kill_web_socket(server, web_socket_port):
    """
    Kills given websockify process for a server and websocket port
    :param server: address of server
    :param web_socket_port: web socket port
    :return: boolean
    """
    logger.debug("Killing webConsole sessions")
    cmd = 'ps -ef | grep "websockify.py ' + server + ':' + web_socket_port + \
          '" | awk \'{ print $2 }\' | xargs -n 1 kill'
    logger.debug("Running cmd: " + cmd)
    rt = os.system(cmd)
    if rt == 0:
        return True
    else:
        return False


def get_used_ips():
    """
    get a list of all IPs that have been configured on topologyIcon objects
    and also append all the current dhcp leases as well
    :return: list of used ips
    """

    all_ips = list()

    topologies = Topology.objects.all()

    ip_pattern = '\d+\.\d+\.\d+\.\d+'
    for topology in topologies:
        try:
            json_data = json.loads(topology.json)
        except ValueError as ve:
            logger.error(ve)
            logger.error("Could not parse saved topology with id: %s" % topology.id)
            continue

        for json_object in json_data:

            if "userData" in json_object and json_object["userData"] is not None and "ip" in json_object["userData"]:
                ud = json_object["userData"]
                ip = ud["ip"]
                if re.match(ip_pattern, ip) is None:
                    logger.info('Found an invalid IP on topology: %s' % topology.id)
                    logger.info("Invalid IP is %s" % ip)
                    logger.info(type(ip))
                    continue

                last_octet = ip.split('.')[-1]
                # logger.debug(topology.id)
                # logger.info("'%s'" % ip)
                # logger.info(last_octet)
                all_ips.append(int(last_octet))

    dhcp_leases = get_consumed_management_ips()
    all_ips.extend(dhcp_leases)

    logger.debug("sorting and returning all_ips")
    all_ips.sort()
    return all_ips


def get_consumed_management_ips():
    """
    Return a list of all ip addresses that are currently consumed on the wistar management network
    THIS ASSUMES A /24 for THE MANAGEMENT NETWORK!
    :return: a list of ints representing the last octet of the /24 management network
    """
    all_ips = list()

    # let's also grab consumed management ips as well
    if configuration.deployment_backend == "openstack":
        if openstackUtils.connect_to_openstack():
            dhcp_leases = openstackUtils.get_consumed_management_ips()
        else:
            return all_ips
    else:
        dhcp_leases = osUtils.get_dhcp_leases()
        # let's also grab current dhcp reservations
        dhcp_reservations = osUtils.get_dhcp_reservations()
        for dr in dhcp_reservations:
            ip = str(dr["ip-address"])
            last_octet = ip.split('.')[-1]
            all_ips.append(int(last_octet))

    for lease in dhcp_leases:
        ip = str(lease["ip-address"])
        logger.debug("adding active lease %s" % ip)
        last_octet = ip.split('.')[-1]
        all_ips.append(int(last_octet))

    return all_ips


def get_used_ips_from_topology_json(json_string):
    json_data = json.loads(json_string)
    all_ips = []
    for json_object in json_data:
        if "userData" in json_object and "wistarVm" in json_object["userData"]:
            ud = json_object["userData"]
            ip = ud["ip"]
            last_octet = ip.split('.')[-1]
            all_ips.append(int(last_octet))

    all_ips.sort()
    return all_ips


def get_next_ip(all_ips, floor):
    try:

        all_ips.sort()

        logger.debug("floor is " + str(floor))

        for i in range(2, 254):
            if i > floor and i not in all_ips:
                return i

    except Exception as e:
        logger.debug(e)
        return floor


def create_disk_instance(device, disk_params):
    """
    Creates a disk according to the parameters specified.
    Can be blank, image, or config_drive

    :param device: device dictionary created from wistarUtils.loadJson()
    :param disk_params: parameters for the specific disk we are working with
    :return: the path to the created disk or ""
    """

    domain_name = device["name"]
    disk_instance_path = ""

    if "type" in disk_params:
        if disk_params["type"] == "image" and "image_id" in disk_params:
            logger.debug("Creating secondary/tertiary Disk information")
            image_id = disk_params["image_id"]
            disk_image = Image.objects.get(pk=image_id)
            disk_base_path = settings.MEDIA_ROOT + "/" + disk_image.filePath.url

            disk_instance_path = osUtils.get_instance_path_from_image(disk_base_path,
                                                                      domain_name + "_secondary_image.img"
                                                                      )

            if not osUtils.check_path(disk_instance_path):
                if not osUtils.create_thin_provision_instance(disk_base_path,
                                                              domain_name + "_secondary_image.img"
                                                              ):
                    raise Exception("Could not create image instance for image: " + disk_base_path)

        elif disk_params["type"] == "blank":
            disk_instance_path = settings.MEDIA_ROOT \
                                 + "/user_images/instances/" + domain_name + "_secondary_blank.img"

            disk_size = "16G"
            if "size" in disk_params:
                disk_size = disk_params["size"]

            if not osUtils.check_path(disk_instance_path):
                if not osUtils.create_blank_image(disk_instance_path, disk_size):
                    raise Exception("Could not create image instance for image: " + disk_instance_path)

        elif disk_params["type"] == "config_drive":
            # let's check if config_drive is supported for this vm_type!
            # this is usually used for vMX in openstack, however, we can also use it here for KVM deployments
            disk_instance_path = ''
            if "configDriveSupport" in device and device["configDriveSupport"] is True:

                logger.debug("Lets create a config-drive!")

                # keep a dict of files with format: filename: filecontents
                files = dict()
                params = device["configDriveParams"]
                if "configDriveParamsFile" in device and device["configDriveParamsFile"]:
                    logger.debug("Using inline config_drive format")
                    # behavior change 12-28-2016 - allow passing a list of templates and destinations
                    # instead of defining the params directly on the device object
                    # if the configDriveParams is a dict, then this is an older topology, leave this code here
                    # to still support them - otherwise fall through to the isinstance check for list type for
                    # newer style configuration
                    if isinstance(params, dict):
                        name = device["configDriveParamsFile"]
                        file_data = ""
                        # config drive params are usually a dict - to make json serialization easier
                        # for our purposes here, let's just make a file with a single key: value per line
                        # note, we can add a serialization format to the vm_type.js if needed here
                        # only currently used for /boot/loader.conf in vmx and riot
                        for k in params:
                            file_data += '%s="%s"\n' % (k, params[k])

                        files[name] = file_data

                        # junos customization
                        # let's also inject a default config here as well if possible!
                        if "junos" in device["type"]:
                            logger.debug("Creating Junos configuration template")
                            junos_config = osUtils.get_junos_default_config_template(device["name"],
                                                                                     device["label"],
                                                                                     device["password"],
                                                                                     device["ip"],
                                                                                     device["managementInterface"])

                            if junos_config is not None:
                                files["/juniper.conf"] = junos_config

                # check for new (12-28-2016) style config drive params definition
                if isinstance(params, list):
                    logger.debug("params is a list")
                    for p in params:
                        if "template" in p and "destination" in p:
                            file_data = None
                            file_data = osUtils.compile_config_drive_params_template(
                                p["template"],
                                device["name"],
                                device["label"],
                                device["password"],
                                device["ip"],
                                device["managementInterface"]
                            )
                            if file_data is not None:
                                files[p["destination"]] = file_data

                disk_instance_path = osUtils.create_config_drive(device["name"], files)
                if disk_instance_path is None:
                    disk_instance_path = ''

    logger.debug("Using %s" % disk_instance_path)
    return disk_instance_path
