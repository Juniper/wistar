import json
import libvirtUtils as lu
import osUtils as ou
import os 
import subprocess
from multiprocessing import Process
import time

macIndex = 0

# silly attempt to keep mac addresses unique
# use the topology id to generate 2 octets, and the number of
# macs used so far to generate the last one
def generateNextMac(topo_id):
    global macIndex
    base = "52:54:00:"
    tid = "%04x" % int(topo_id)
    macBase = base + str(tid[:2]) + ":" + str(tid[2:4]) + ":"
    mac = macBase + (str("%02x" % macIndex)[:2])

    macIndex += 1
    return mac

def getDeviceName(index):
    return "vmx" + str("%02i" % index)

# load raw Json into an object containing a list of devices and a list of networks
def loadJson(rawJson, topo_id):

    # reset macIndex for this run
    global macIndex
    macIndex = 0
    jsonData = json.loads(rawJson)

    devices = []
    networks = []

    # do we need to create the em1 as well? 
    # only if we have at least 1 vmx
    em1_required = False

    # external bridge is a highlander (there can be only one)
    externalUUID = "";
    # allow multiple internal bridges
    internalUUIDs = [];

    deviceIndex = 0
    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            ud = jsonObject["userData"]
            print "Found a topoIcon"
            device = {}

            device["name"] = "t" + str(topo_id) + "_" + ud["label"]
            device["label"] = ud["label"]
            device["imageId"] = ud["image"]
            device["type"] = ud["type"]
            device["ip"] = ud["ip"]

            # sanity check in case this is an old topology without these keys
            # keys introducted in 20150306
            # set sensible defaults
            device["ram"] = "2048"
            device["cpu"] = "2"
            if ud.has_key("cpu"):
                device["cpu"] = ud["cpu"]
            
            if ud.has_key("ram"):
                device["ram"] = ud["ram"]

            device["password"] = ud["password"]
            device["uuid"] = jsonObject["id"]
            device["interfaces"] = []
            device["managementInterfaces"] = []
            if ou.checkIsLinux():
                device["vncPort"] = lu.getNextDomainVncPort(deviceIndex)
            else :
                device["vncPort"] = "5900"
    
            deviceIndex += 1

            # if this is a vmx, let's create the mandatory two mgmt ports in the 
            # first two slots
            if ud["type"] == "junos_vmx":

                # ok, we need this network to be created later
                em1_required = True

                # manually create em0 and em1 interfaces            
                em0 = {}
                em0["mac"] = generateNextMac(topo_id)
                em0["bridge"] = "virbr0"
                em0["slot"] = "0x04"
                em0["ip"] = jsonObject["userData"]["ip"]
                em1 = {}
                em1["mac"] = generateNextMac(topo_id)
                em1["bridge"] = "t" + str(topo_id) + "_em1bridge"
                em1["slot"] = "0x05"

                device["managementInterfaces"].append(em0)
                device["managementInterfaces"].append(em1)

            devices.append(device)
        elif jsonObject["type"] == "draw2d.shape.node.externalCloudIcon":
            externalUUID = jsonObject["id"];
        elif jsonObject["type"] == "draw2d.shape.node.internalCloudIcon":
            internalUUIDs.append(jsonObject["id"]);

    # just run through again to ensure we already have all the devices ready to go!
    # note - set this to 1 to avoid using special name br0 -
    # per qemu docs - virbr0 will connect directly to host bridge and is probably not what we want
    # FIXME - add UI later to specify which host you want to do that for
    connIndex = 1

    # create the em1bridge if necessary
    if em1_required == True:
        em1bridge = {}
        em1bridge["name"] = "t" + str(topo_id) + "_em1bridge"
        em1bridge["mac"] = generateNextMac(topo_id)
        networks.append(em1bridge)

    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.Connection":
            targetUUID = jsonObject["target"]["node"]
            sourceUUID = jsonObject["source"]["node"]

            # should we create a new bridge for this connection?
            createBridge = True

            bridge_name = "t" + str(topo_id) + "_br" + str(connIndex)

            for d in devices:
                if d["uuid"] == sourceUUID:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + 6)
                    interface = {}
                    interface["mac"] = generateNextMac(topo_id)

                    if targetUUID in internalUUIDs:
                        bridge_name = "t" + str(topo_id) + "_private_br" + str(internalUUIDs.index(targetUUID))
                        interface["bridge"] = bridge_name
                    elif targetUUID == externalUUID:
                        # FIXME - this is hard coded to br0 - should maybe use a config object asp
                        bridge_name = "br0"
                        interface["bridge"] = bridge_name
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    interface["linkId"] = jsonObject["id"]
                    d["interfaces"].append(interface)

                elif d["uuid"] == targetUUID:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + 6)
                    interface = {}
                    interface["mac"] = generateNextMac(topo_id)

                    if sourceUUID in internalUUIDs:
                        bridge_name = "t" + str(topo_id) + "_private_br" + str(internalUUIDs.index(sourceUUID))
                        interface["bridge"] = bridge_name
                    if sourceUUID == externalUUID:
                        bridge_name = "br0"
                        interface["bridge"] = bridge_name
                    else:
                        interface["bridge"] = bridge_name

                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    interface["linkId"] = jsonObject["id"]
                    d["interfaces"].append(interface)

            # let's check to see if we've already marked this internal bridge for creation
            for c in networks:
                if c["name"] == bridge_name:
                    print "Skipping bridge creation for " + bridge_name
                    createBridge = False
                    continue

            if createBridge == True and bridge_name != "br0":
                print "Setting " + bridge_name +  " for creation"
                connection = {}
                connection["name"] = bridge_name
                connection["mac"] = generateNextMac(topo_id)
                networks.append(connection)
                connIndex += 1

  
    # now let's add a final mgmt interface to all non-vmx instances 
    # we need to loop again because we didn't know how many interfaces were on this instance
    # until after we run through the connections first
    for d in devices: 
        if d["type"] != "junos_vmx":
            slot = "%#04x" % int(len(d["interfaces"]) + 6)
            interface = {}
            interface["mac"] = generateNextMac(topo_id)
            interface["bridge"] = "virbr0"
            interface["slot"] = slot
            if d["type"] == "linux":
                interface["name"] = "eth" + str(len(d["interfaces"]))
            else: 
                interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
            d["interfaces"].append(interface)

    returnObject = {}
    returnObject["networks"] = networks
    returnObject["devices"] = devices
    return returnObject


# iterate through topology json and increment
# all found management IPs to provide for some
# small uniqueness protection. The right way to do this
# would be to track all used management ips, but I would rather
# each topology be a transient thing to be used and thrownaway
def cloneTopology(rawJson):
    jsonData = json.loads(rawJson)

    numTopoIcons = 0

    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            numTopoIcons = numTopoIcons + 1

    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            ud = jsonObject["userData"]
            ip = ud["ip"]
            ipOctets = ip.split('.')
            newOctet = int(ipOctets[3]) + numTopoIcons
            if newOctet > 255:
                newOctet = newOctet - 255
            ipOctets[3] = str(newOctet)
            newIp = ".".join(ipOctets)
            ud["ip"] = newIp

    return json.dumps(jsonData)


def launchWebSocket(vncPort, wsPort, server):
    args = " 127.0.0.1:" + str(vncPort) + " 127.0.0.1:" + str(wsPort) + " &"
    path = os.path.abspath(os.path.dirname(__file__))
    ws = os.path.join(path, "../../webConsole/bin/websockify.py")
    
    cmd = str(ws) + args

    print cmd

    proc = subprocess.Popen(ws + " " + server + ":" + str(vncPort) + " " + server + ":" + str(wsPort) + " &", 
        shell=True, close_fds=True)
    time.sleep(1)
    return proc.pid

def checkPid(pid):        
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

def checkWebSocket(server, wsPort):
    rt = os.system('ps -ef | grep "websockify.py ' + server + ':' + wsPort + '" | grep -v grep')
    if rt == 0:
        return True
    else:
        return False

def killWebSocket(server, wsPort):
    print "Killing webConsole sessions"
    cmd = 'ps -ef | grep "websockify.py ' + server + ':' + wsPort + '" | awk "{ print $2 }" | xargs -n 1 kill'
    print "Running cmd: " + cmd

