import json
import os
import subprocess
import time

import libvirtUtils
from images.models import Image
from wistar import configuration

# keep track of how many mac's we've used
macIndex = 0


# silly attempt to keep mac addresses unique
# use the topology id to generate 2 octets, and the number of
# macs used so far to generate the last one
def generate_next_mac(topology_id):
    global macIndex
    base = "52:54:00:"
    tid = "%04x" % int(topology_id)
    mac_base = base + str(tid[:2]) + ":" + str(tid[2:4]) + ":"
    mac = mac_base + (str("%02x" % macIndex)[:2])

    macIndex += 1
    return mac


def get_heat_json_from_topology_config(config):

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
        elif network["name"].startswith("br"):
            p["network_id"] = configuration.openstack_external_network
        else:
            p["network_id"] = {"get_resource": network["name"]}

        nrs["properties"] = p

        template["resources"][network["name"]] = nr
        template["resources"][network["name"] + "_subnet"] = nrs

    for device in config["devices"]:

        # determine openstack flavor here
        # possibly a good idea to modify these to not have such
        # stupidly high disk space requirements!
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
        template["resources"][device["name"]] = dr

    for device in config["devices"]:
        index = 0
        for port in device["interfaces"]:
            pr = dict()
            pr["type"] = "OS::Neutron::Port"
            p = dict()

            if port["bridge"] == "virbr0":
                p["network_id"] = configuration.openstack_mgmt_network
            elif port["bridge"].startswith("br"):
                p["network_id"] = configuration.openstack_external_network
            else:
                p["network_id"] = {"get_resource": network["name"]}

            pr["properties"] = p
            template["resources"][device["name"] + "_port" + str(index)] = pr
            index += 1

    return json.dumps(template)


def load_config_from_topology_json(raw_json, topology_id):
    """
    Generates dict containing a list of devices and networks from the topology JSON
    :param raw_json: json from the stored Topology object
    :param topology_id: id of the topology from the db
    :return: dict containing list of devices and networks
    """
    print "loading json object from topology: %s" % topology_id
    global macIndex
    macIndex = 0
    json_data = json.loads(raw_json)

    # configuration json will consist of a list of devices and networks
    # iterate through the raw_json and construct the appropriate device and network objects
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
            print "Found a topology vm"
            device = dict()

            device["name"] = "t" + str(topology_id) + "_" + user_data["name"]
            device["label"] = user_data["name"]
            device["imageId"] = user_data["image"]

            print json_object

            device["ram"] = user_data["ram"]
            device["cpu"] = user_data["cpu"]
            device["interfacePrefix"] = user_data["interfacePrefix"]
            device["configurationFile"] = user_data["configurationFile"]
            device["slot_offset"] = user_data["pciSlotOffset"]
            device["interfaceType"] = user_data["interfaceType"]

            device["smbiosProduct"] = user_data["smbios_product_string"]
            device["smbiosManufacturer"] = user_data["smbios_manufacturer"]
            device["smbiosVersion"] = user_data["smbios_version"]

            device["secondaryDiskType"] = user_data["secondary_disk_type"]
            device["tertiaryDiskType"] = user_data["tertiary_disk_type"]

            device["managementInterface"] = user_data["mgmtInterface"]

            if "secondaryDisk" in user_data:
                device["secondaryDisk"] = user_data["secondaryDisk"]

            if "tertiaryDisk" in user_data:
                device["tertiaryDisk"] = user_data["tertiaryDisk"]

            device["ip"] = user_data["ip"]
            device["password"] = user_data["password"]

            device["companionInterfaceMirror"] = user_data["companionInterfaceMirror"]
            device["companionInterfaceMirrorOffset"] = user_data["companionInterfaceMirrorOffset"]
            device["mirroredInterfaces"] = []

            device["configScriptId"] = 0
            device["configScriptParam"] = 0

            if "configScriptId" in user_data:
                print "Found a configScript to use!"
                device["configScriptId"] = user_data["configScriptId"]
                device["configScriptParam"] = user_data["configScriptParam"]

            device["uuid"] = json_object["id"]
            device["interfaces"] = []

            device["vncPort"] = libvirtUtils.get_next_domain_vnc_port(device_index)

            device_index += 1

            # use chassis name as the naming convention for all the bridges
            # we'll create networks as 'topology_id + _ + chassis_name + function
            # i.e. t1_vmx01_re and t1_vmx01_pfe
            chassis_name = user_data["name"]
            if "parentName" in user_data:
                chassis_name = user_data["parentName"]

            if "parent" in user_data:
                device["parent"] = user_data["parent"]

            print "Using chassis name of: %s" % chassis_name

            # set this property for use later, we'll loop again after we have configured all the conections
            # to create the management interface at the end (i.e. for Linux hosts)
            device["mgmtInterfaceIndex"] = user_data["mgmtInterfaceIndex"]

            # now let's create the interfaces declared so far
            if user_data["mgmtInterfaceIndex"] != -1:
                device_interface_wiring = dict()

                # setup management interface
                # management interface mi will always be connected to default management network (virbr0 on KVM)
                mi = dict()
                mi["mac"] = generate_next_mac(topology_id)
                mi["bridge"] = "virbr0"
                mi["type"] = user_data["mgmtInterfaceType"]

                device_interface_wiring[user_data["mgmtInterfaceIndex"]] = mi

                for dummy in user_data["dummyInterfaceList"]:
                    dm = dict()
                    dm["mac"] = generate_next_mac(topology_id)
                    dm["bridge"] = "t%s_d" % str(topology_id)
                    dm["type"] = user_data["interfaceType"]

                    device_interface_wiring[dummy] = dm

                for companion in user_data["companionInterfaceList"]:
                    cm = dict()
                    cm["mac"] = generate_next_mac(topology_id)
                    cm["bridge"] = "t%s_%s_c" % (str(topology_id), chassis_name)
                    cm["type"] = user_data["interfaceType"]

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

                    if target_uuid in internal_bridges:
                        bridge_name = "t" + str(topology_id) + "_private_br" + str(internal_bridges.index(target_uuid))
                        interface["bridge"] = bridge_name
                    elif target_uuid in external_bridges.keys():
                        bridge_name = external_bridges[target_uuid]
                        interface["bridge"] = bridge_name
                        # do not create external bridges...
                        create_bridge = False
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
                    print "Skipping bridge creation for " + bridge_name
                    create_bridge = False
                    continue

            if create_bridge is True:
                print "Setting " + bridge_name + " for creation"
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
            mi["type"] = user_data["mgmtInterfaceType"]
            d["interfaces"].append(mi)

    topology_config = dict()
    topology_config["networks"] = networks
    topology_config["devices"] = devices
    return topology_config


# iterate through topology json and increment
# all found management IPs to provide for some
# small uniqueness protection. The right way to do this
# would be to track all used management ips, but I would rather
# each topology be a transient thing to be used and throwaway
def clone_topology(raw_json):
    json_data = json.loads(raw_json)

    num_topo_icons = 0

    for json_object in json_data:
        if "userData" in json_object and "wistarVm" in json_object["userData"]:
            num_topo_icons += 1

    for json_object in json_data:
        if "userData" in json_object and "wistarVm" in json_object["userData"]:
            ud = json_object["userData"]
            ip = ud["ip"]
            ip_octets = ip.split('.')
            new_octets = int(ip_octets[3]) + num_topo_icons
            if new_octets > 255:
                new_octets -= 255
            ip_octets[3] = str(new_octets)
            new_ip = ".".join(ip_octets)
            ud["ip"] = new_ip

    return json.dumps(json_data)


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
    
    print cmd

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
    rt = os.system('ps -ef | grep "websockify.py ' + server + ':' + web_socket_port + '" | grep -v grep')
    if rt == 0:
        return True
    else:
        return False


def kill_web_socket(server, web_socket_port):
    print "Killing webConsole sessions"
    cmd = 'ps -ef | grep "websockify.py ' + server + ':' + web_socket_port + '" | awk "{ print $2 }" | xargs -n 1 kill'
    print "Running cmd: " + cmd


