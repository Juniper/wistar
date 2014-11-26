import json
import libvirtUtils as lu
import osUtils as ou

macIndex = 0

# silly attempt to keep mac addresses unique
# use the topology id to generate 2 octest, and the number of
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

    # grab all currently defined vncPorts
    if ou.checkIsLinux():
        nextAvailableVncPort = lu.getNextDomainVncPort()
    else:
        # not required for mac / virtualbox
        nextAvailableVncPort = 5900

    # reset macIndex for this run
    global macIndex
    macIndex = 0
    jsonData = json.loads(rawJson)

    devices = []
    networks = []

    deviceIndex = 1
    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
            ud = jsonObject["userData"]
            print "Found a topoIcon"
            device = {}
            device["name"] = "t" + str(topo_id) + "_" + jsonObject["userData"]["label"]
            device["imageId"] = jsonObject["userData"]["image"]
            device["uuid"] = jsonObject["id"]
            device["interfaces"] = []
            device["managementInterfaces"] = []

            device["vncPort"] = int(nextAvailableVncPort) + deviceIndex
            deviceIndex += 1

            # manually create em0 and em1 interfaces            
            em0 = {}
            em0["mac"] = generateNextMac(topo_id)
            em0["bridge"] = "virbr0"
            em0["slot"] = "0x04"
            em1 = {}
            em1["mac"] = generateNextMac(topo_id)
            em1["bridge"] = "t" + str(topo_id) + "_em1bridge"
            em1["slot"] = "0x05"

            device["managementInterfaces"].append(em0)
            device["managementInterfaces"].append(em1)

            devices.append(device)
        #elif jsonObject["type"] == "draw2d.Connection":
            #print "found a connection"

    # just run through again to ensure we already have all the devices ready to go!
    # note - set this to 1 to avoid using special name br0 -
    # per qemu docs - virbr0 will connect directly to host bridge and is probably not what we want
    # FIXME - add UI later to specify which host you want to do that for
    connIndex = 1

    # fix - just add em0 to virbr0
    #em0bridge = {}
    #em0bridge["name"] = "em0bridge"
    #em0bridge["mac"] = generateNextMac()
    #networks.append(em0bridge)
    
    em1bridge = {}
    em1bridge["name"] = "t" + str(topo_id) + "_em1bridge"
    em1bridge["mac"] = generateNextMac(topo_id)
    networks.append(em1bridge)

    for jsonObject in jsonData:
        if jsonObject["type"] == "draw2d.Connection":
            targetUUID = jsonObject["target"]["node"]
            sourceUUID = jsonObject["source"]["node"]
            for d in devices:
                if d["uuid"] == sourceUUID:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + 6)
                    interface = {}
                    interface["mac"] = generateNextMac(topo_id)
                    interface["bridge"] = "t" + str(topo_id) + "_br" + str(connIndex)
                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    d["interfaces"].append(interface)

                elif d["uuid"] == targetUUID:
                    # slot should always start with 6
                    slot = "%#04x" % int(len(d["interfaces"]) + 6)
                    interface = {}
                    interface["mac"] = generateNextMac(topo_id)
                    interface["bridge"] = "t" + str(topo_id) + "_br" + str(connIndex)
                    interface["slot"] = slot
                    interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
                    d["interfaces"].append(interface)


            connection = {}
            connection["name"] = "t" + str(topo_id) + "_br" + str(connIndex)
            connection["mac"] = generateNextMac(topo_id)
            networks.append(connection)
            connIndex += 1

    returnObject = {}
    returnObject["networks"] = networks
    returnObject["devices"] = devices
    return returnObject


