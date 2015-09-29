import json
import os
import subprocess
import time

import libvirtUtils
import osUtils

macIndex = 0


# silly attempt to keep mac addresses unique
# use the topology id to generate 2 octets, and the number of
# macs used so far to generate the last one
def generate_next_mac(topo_id):
    global macIndex
    base = "52:54:00:"
    tid = "%04x" % int(topo_id)
    mac_base = base + str(tid[:2]) + ":" + str(tid[2:4]) + ":"
    mac = mac_base + (str("%02x" % macIndex)[:2])

    macIndex += 1
    return mac


def get_device_name(index):
    return "vmx" + str("%02i" % index)


# load raw Json into an object containing a list of devices and a list of networks
def load_json(raw_json, topo_id):

    # reset macIndex for this run
    global macIndex
    macIndex = 0
    json_data = json.loads(raw_json)

    devices = []
    networks = []

    # do we need to create the em1 as well? 
    # only if we have at least 1 vmx
    em1_required = False

    # external bridge is a highlander (there can be only one)
    external_uuid = ""
    # allow multiple internal bridges
    internal_uuids = []

    device_index = 0

    # interface pci slot has special significance for vmx <= 14.1 and >= 14.2
    # by default let's make vmx phase 1 happy
    slot_offset = 6
    for json_object in json_data:
        if json_object["type"] == "draw2d.shape.node.topologyIcon":
            user_data = json_object["userData"]
            print "Found a topoIcon"
            device = dict()

            device["name"] = "t" + str(topo_id) + "_" + user_data["label"]
            device["label"] = user_data["label"]
            device["imageId"] = user_data["image"]
            device["type"] = user_data["type"]
            device["ip"] = user_data["ip"]

            # sanity check in case this is an old topology without these keys
            # keys introduced in 20150306
            # set sensible defaults
            device["ram"] = "2048"
            device["cpu"] = "2"
            if "cpu" in user_data:
                device["cpu"] = user_data["cpu"]
            
            if "ram" in user_data:
                device["ram"] = user_data["ram"]

            device["password"] = user_data["password"]
            device["uuid"] = json_object["id"]
            device["interfaces"] = []
            device["managementInterfaces"] = []
            if osUtils.check_is_linux():
                device["vncPort"] = libvirtUtils.get_next_domain_vnc_port(device_index)
            else :
                device["vncPort"] = "5900"
    
            device_index += 1

            # if this is a vmx, let's create the mandatory two mgmt ports in the 
            # first two slots
            if user_data["type"] == "junos_vmx":

                # ok, we need this network to be created later
                em1_required = True

                # manually create em0 and em1 interfaces            
                em0 = dict()
                em0["mac"] = generate_next_mac(topo_id)
                em0["bridge"] = "virbr0"
                em0["slot"] = "0x04"
                em0["ip"] = json_object["userData"]["ip"]
                em1 = dict()
                em1["mac"] = generate_next_mac(topo_id)
                em1["bridge"] = "t" + str(topo_id) + "_em1bridge"
                em1["slot"] = "0x05"

                device["managementInterfaces"].append(em0)
                device["managementInterfaces"].append(em1)
           
            # junos >= 15.1 requires management slots to be moved to 0x03 and 0x04
            elif user_data["type"] == "junos_vmx_p2":

                # reset slot index to 4
                # requirement is for the user to create the first
                # network between RE and PFE always!

                slot_offset = 6
                # ok, we do not need this network to be created later
                em1_required = False

                # manually create em0 and em1 interfaces            
                em0 = dict()
                em0["mac"] = generate_next_mac(topo_id)
                em0["bridge"] = "virbr0"
                em0["slot"] = "0x03"
                em0["ip"] = json_object["userData"]["ip"]

                # chassis name - Convention is that phase 2 images will be grouped into chassis systems
                # based on the user label supplied. The Convention is 'name_function' so a device with
                # a label of vmx1_re0 will be grouped with other devices named vmx1_XXX
                if "_" not in user_data["label"]:
                    print "Incorrect naming format for vmx phase 2 instance"
                    raise Exception("Improper naming format for vmx phase 2!")

                chassis_name = user_data["label"].split('_')[0]
                print "Using chassis nane of: %s" % chassis_name

                # em1 is always pfe to re bridge
                em1 = dict()
                em1["mac"] = generate_next_mac(topo_id)
                em1["bridge"] = "t%s_%s_re" % (str(topo_id), chassis_name)
                em1["slot"] = "0x04"

                # let's check if we've already set this bridge to be created
                found = False
                for network in networks:
                    if network["name"] == em1["bridge"]:
                        found = True
                        break

                # let's go ahead and add this to the networks list if needed
                if not found:
                    em1_network = dict()
                    em1_network["name"] = em1["bridge"]
                    em1_network["mac"] = generate_next_mac(topo_id)
                    networks.append(em1_network)

                # em2 is pfe to pfe bridge
                em2 = dict()
                em2["mac"] = generate_next_mac(topo_id)
                em2["bridge"] = "t%s_%s_pfe" % (str(topo_id), chassis_name)
                em2["slot"] = "0x05"

                # let's check if we've already set this bridge to be created
                found = False
                for network in networks:
                    if network["name"] == em2["bridge"]:
                        found = True
                        break

                # let's go ahead and add this to the networks list if needed
                if not found:
                    em1_network = dict()
                    em1_network["name"] = em2["bridge"]
                    em1_network["mac"] = generate_next_mac(topo_id)
                    networks.append(em1_network)

                device["managementInterfaces"].append(em0)
                device["managementInterfaces"].append(em1)
                device["managementInterfaces"].append(em2)

            devices.append(device)
        elif json_object["type"] == "draw2d.shape.node.externalCloudIcon":
            external_uuid = json_object["id"]
        elif json_object["type"] == "draw2d.shape.node.internalCloudIcon":
            internal_uuids.append(json_object["id"])

    # just run through again to ensure we already have all the devices ready to go!
    # note - set this to 1 to avoid using special name br0 -
    # per qemu docs - virbr0 will connect directly to host bridge and is probably not what we want
    # FIXME - add UI later to specify which host you want to do that for
    conn_index = 1

    # create the em1bridge if necessary
    if em1_required is True:
        em1bridge = dict()
        em1bridge["name"] = "t" + str(topo_id) + "_em1bridge"
        em1bridge["mac"] = generate_next_mac(topo_id)
        networks.append(em1bridge)

    for json_object in json_data:
        if json_object["type"] == "draw2d.Connection":
            target_uuid = json_object["target"]["node"]
            source_uuid = json_object["source"]["node"]

            # should we create a new bridge for this connection?
            create_bridge = True

            bridge_name = "t" + str(topo_id) + "_br" + str(conn_index)

            for d in devices:
                if d["uuid"] == source_uuid:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + slot_offset)
                    interface = dict()
                    interface["mac"] = generate_next_mac(topo_id)

                    if target_uuid in internal_uuids:
                        bridge_name = "t" + str(topo_id) + "_private_br" + str(internal_uuids.index(target_uuid))
                        interface["bridge"] = bridge_name
                    elif target_uuid == external_uuid:
                        # FIXME - this is hard coded to br0 - should maybe use a config object asp
                        bridge_name = "br0"
                        interface["bridge"] = bridge_name
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    interface["linkId"] = json_object["id"]
                    d["interfaces"].append(interface)

                elif d["uuid"] == target_uuid:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + slot_offset)
                    interface = dict()
                    interface["mac"] = generate_next_mac(topo_id)

                    if source_uuid in internal_uuids:
                        bridge_name = "t" + str(topo_id) + "_private_br" + str(internal_uuids.index(source_uuid))
                        interface["bridge"] = bridge_name
                    if source_uuid == external_uuid:
                        bridge_name = "br0"
                        interface["bridge"] = bridge_name
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    interface["linkId"] = json_object["id"]
                    d["interfaces"].append(interface)

            # let's check to see if we've already marked this internal bridge for creation
            for c in networks:
                if c["name"] == bridge_name:
                    print "Skipping bridge creation for " + bridge_name
                    create_bridge = False
                    continue

            if create_bridge is True and bridge_name != "br0":
                print "Setting " + bridge_name + " for creation"
                connection = dict()
                connection["name"] = bridge_name
                connection["mac"] = generate_next_mac(topo_id)
                networks.append(connection)
                conn_index += 1

    # now let's add a final mgmt interface to all non-vmx instances 
    # we need to loop again because we didn't know how many interfaces were on this instance
    # until after we run through the connections first
    for d in devices: 
        if d["type"] != "junos_vmx" and d["type"] != "junos_vmx_p2":
            slot = "%#04x" % int(len(d["interfaces"]) + 6)
            interface = dict()
            interface["mac"] = generate_next_mac(topo_id)
            interface["bridge"] = "virbr0"
            interface["slot"] = slot
            if d["type"] == "linux":
                interface["name"] = "eth" + str(len(d["interfaces"]))
            else: 
                interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
            d["interfaces"].append(interface)

    return_object = dict()
    return_object["networks"] = networks
    return_object["devices"] = devices
    return return_object


# iterate through topology json and increment
# all found management IPs to provide for some
# small uniqueness protection. The right way to do this
# would be to track all used management ips, but I would rather
# each topology be a transient thing to be used and throwaway
def clone_topology(raw_json):
    json_data = json.loads(raw_json)

    num_topo_icons = 0

    for jsonObject in json_data:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            num_topo_icons = num_topo_icons + 1

    for jsonObject in json_data:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            ud = jsonObject["userData"]
            ip = ud["ip"]
            ip_octets = ip.split('.')
            new_octets = int(ip_octets[3]) + num_topo_icons
            if new_octets > 255:
                new_octets = new_octets - 255
            ip_octets[3] = str(new_octets)
            newIp = ".".join(ip_octets)
            ud["ip"] = newIp

    return json.dumps(json_data)


def launch_web_socket(vncPort, wsPort, server):
    
    path = os.path.abspath(os.path.dirname(__file__))
    ws = os.path.join(path, "../../webConsole/bin/websockify.py")

    web_socket_path = os.path.abspath(ws)

    cmd = "%s %s:%s %s:%s --idle-timeout=120 &" % (web_socket_path, server, vncPort, server, wsPort)
    
    print cmd

    proc = subprocess.Popen(cmd, shell=True, close_fds=True)
    time.sleep(1)
    return proc.pid


def check_pid(pid):
    """ Check For the existence of a unix pid. 
        shamelessly taken from stackoverflow
        http://stackoverflow.com/questions/568271/how-to-check-if-there-exists-a-process-with-a-given-pid
    """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True


def check_web_socket(server, wsPort):
    rt = os.system('ps -ef | grep "websockify.py ' + server + ':' + wsPort + '" | grep -v grep')
    if rt == 0:
        return True
    else:
        return False


def kill_web_socket(server, wsPort):
    print "Killing webConsole sessions"
    cmd = 'ps -ef | grep "websockify.py ' + server + ':' + wsPort + '" | awk "{ print $2 }" | xargs -n 1 kill'
    print "Running cmd: " + cmd


