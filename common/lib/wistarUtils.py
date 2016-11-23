import json
import logging
import os
import subprocess
import time

from django.core.exceptions import ObjectDoesNotExist

import libvirtUtils
import osUtils
from images.models import Image
from topologies.models import Topology
from wistar import configuration
from wistar import settings

logger = logging.getLogger(__name__)
# keep track of how many mac's we've used
mac_counter = 0


def generate_next_mac(topology_id):
    """
    silly attempt to keep mac addresses unique
    use the topology id to generate 2 octets, and the number of
    macs used so far to generate the last one
    :param topology_id: id of the topology we are building 
    :return: mostly unique mac address that should be safe to deploy
    """
    global mac_counter
    base = "52:54:00:"
    tid = "%04x" % int(topology_id)
    mac_base = base + str(tid[:2]) + ":" + str(tid[2:4]) + ":"
    mac = mac_base + (str("%02x" % mac_counter)[:2])

    mac_counter += 1
    return mac


def get_heat_json_from_topology_config(config):
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

        p = dict()
        p["cidr"] = "1.1.1.0/24"
        p["enable_dhcp"] = False
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

    for device in config["devices"]:

        # determine openstack flavor here
        device_ram = int(device["ram"])

        if device_ram >= 16384:
            flavor = "m1.xlarge"
        elif device_ram >= 8192:
            flavor = "m1.large"
        elif device_ram >= 4096:
            flavor = "m1.medium"
        elif device_ram >= 1024:
            flavor = "m1.small"
        else:
            flavor = "m1.tiny"

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

        image = Image.objects.get(pk=device["imageId"])
        image_name = image.name
        dr["properties"]["image"] = image_name
        dr["properties"]["name"] = device["name"]

        if device["configDriveSupport"]:
            dr["properties"]["config_drive"] = True
            metadata = device["configDriveParams"]
            metadata["hostname"] = device["name"]
            dr["properties"]["metadata"] = metadata

        template["resources"][device["name"]] = dr

    for device in config["devices"]:
        index = 0
        for port in device["interfaces"]:
            pr = dict()
            pr["type"] = "OS::Neutron::Port"
            p = dict()

            if port["bridge"] == "virbr0":
                p["network_id"] = configuration.openstack_mgmt_network
            elif port["bridge"] == configuration.openstack_external_network:
                p["network_id"] = configuration.openstack_external_network
            else:
                p["network_id"] = {"get_resource": port["bridge"]}

            pr["properties"] = p
            template["resources"][device["name"] + "_port" + str(index)] = pr
            index += 1

    return json.dumps(template)


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

    for json_object in json_data:
        if "userData" in json_object and "wistarVm" in json_object["userData"]:
            user_data = json_object["userData"]
            logger.debug("Found a topology vm")
            device = dict()

            device["name"] = "t" + str(topology_id) + "_" + user_data.get("name", "")
            device["label"] = user_data.get("name", "")
            device["imageId"] = user_data.get("image", "")

            try:
                image = Image.objects.get(pk=device["imageId"])
            except ObjectDoesNotExist:
                raise Exception("Not all images are present!")

            logger.debug(json_object)

            device["ram"] = user_data.get("ram", 1024)
            device["cpu"] = user_data.get("cpu", 1)
            device["interfacePrefix"] = user_data.get("interfacePrefix", "")
            device["configurationFile"] = user_data.get("configurationFile", "")
            device["slot_offset"] = int(user_data.get("pciSlotOffset", 3))
            device["interfaceType"] = user_data.get("interfaceType", "")

            device["smbiosProduct"] = user_data.get("smbiosProductString", "")
            device["smbiosManufacturer"] = user_data.get("smbiosManufacturer", "")
            device["smbiosVersion"] = user_data.get("smbiosVersion", "")

            device["secondaryDiskParams"] = user_data.get("secondaryDiskParams", [])
            device["tertiaryDiskParams"] = user_data.get("tertiaryDiskParams", [])

            device["managementInterface"] = user_data.get("mgmtInterface", "")

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

            device["configDriveSupport"] = False

            if "configDriveSupport" in user_data:
                device["configDriveSupport"] = user_data.get("configDriveSupport", "")
                if "configDriveParams" in user_data:
                    device["configDriveParams"] = user_data.get("configDriveParams", "")
                    device["configDriveParamsFile"] = user_data.get("configDriveParamsFile", "")
                else:
                    device["configDriveParams"] = dict()

            if "configScriptId" in user_data:
                logger.debug("Found a configScript to use!")
                device["configScriptId"] = user_data.get("configScriptId", "")
                device["configScriptParam"] = user_data.get("configScriptParam", "")

            device["uuid"] = json_object["id"]
            device["interfaces"] = []

            device["vncPort"] = libvirtUtils.get_next_domain_vnc_port(device_index)

            device_index += 1

            # use chassis name as the naming convention for all the bridges
            # we'll create networks as 'topology_id + _ + chassis_name + function
            # i.e. t1_vmx01_re and t1_vmx01_pfe
            chassis_name = user_data.get("name", "")
            if "parentName" in user_data:
                chassis_name = user_data.get("parentName", "")

            if "parent" in user_data:
                device["parent"] = user_data.get("parent", "")

            logger.debug("Using chassis name of: %s" % chassis_name)

            # set this property for use later, we'll loop again after we have configured all the conections
            # to create the management interface at the end (i.e. for Linux hosts)
            device["mgmtInterfaceIndex"] = user_data.get("mgmtInterfaceIndex", 0)

            # now let's create the interfaces declared so far
            if device["mgmtInterfaceIndex"] != -1:
                device_interface_wiring = dict()

                # setup management interface
                # management interface mi will always be connected to default management network (virbr0 on KVM)
                mi = dict()
                mi["mac"] = generate_next_mac(topology_id)
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
                    cm["bridge"] = "t%s_%s_c" % (str(topology_id), chassis_name)
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
                        bridge_name = "t" + str(topology_id) + "_private_br" + str(internal_bridges.index(target_uuid))
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
                        bridge_name = "t" + str(topology_id) + "_private_br" + str(internal_bridges.index(source_uuid))
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
            mi["mac"] = generate_next_mac(topology_id)
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

        wistar_vm_counter = 0

        for json_object in json_data:
            if "userData" in json_object and "wistarVm" in json_object["userData"]:
                wistar_vm_counter += 1

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

    all_ips = set()

    topologies = Topology.objects.all()

    for topology in topologies:
        json_data = json.loads(topology.json)
        for json_object in json_data:

            if "userData" in json_object and json_object["userData"] is not None and "ip" in json_object["userData"]:
                ud = json_object["userData"]
                ip = ud["ip"]
                last_octet = ip.split('.')[-1]
                all_ips.add(int(last_octet))

    # let's also grab current dhcp leases as well
    dhcp_leases = osUtils.get_dhcp_leases()
    for lease in dhcp_leases:
        ip = str(lease["ip-address"])
        logger.debug("adding active lease %s" % ip)
        last_octet = ip.split('.')[-1]
        all_ips.add(int(last_octet))

    # let's also grab current dhcp reservations
    dhcp_leases = osUtils.get_dhcp_reservations()
    for lease in dhcp_leases:
        ip = str(lease["ip-address"])
        logger.debug("adding active reservation %s" % ip)
        last_octet = ip.split('.')[-1]
        all_ips.add(int(last_octet))

    logger.debug("sorting and returning all_ips")
    all_ips_list = list(all_ips)
    all_ips_list.sort()
    return all_ips_list


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
                if "configDriveParamsFile" in device and device["configDriveParamsFile"]:
                    params = device["configDriveParams"]
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
                junos_types = ['junos_vre', 'junos_vsrx', 'junos_volive']
                if device["type"] in junos_types:
                    logger.debug("Creating Junos configuration template")
                    junos_config = osUtils.get_junos_default_config_template(device["name"],
                                                                             device["label"],
                                                                             device["password"],
                                                                             device["ip"],
                                                                             device["managementInterface"])

                    if junos_config is not None:
                        files["/juniper.conf"] = junos_config

                disk_instance_path = osUtils.create_cloud_drive(device["name"], files)
                if disk_instance_path is None:
                    disk_instance_path = ''

    logger.debug("Using %s" % disk_instance_path)
    return disk_instance_path
