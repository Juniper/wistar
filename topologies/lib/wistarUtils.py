import json

macIndex = 0

# just generate a new mac for us. will break if called more then 256 times
# should be fine for most topologies
def generateNextMac():
	global macIndex
	macBase = "52:54:00:2C:C7:"
	mac = macBase + (str("%02x" % macIndex))

	macIndex += 1
	return mac

def getDeviceName(index):
	return "vmx" + str("%02i" % index)

# load raw Json into an object containing a list of devices and a list of networks
def loadJson(rawJson):

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
			device["name"] = getDeviceName(deviceIndex)
			device["uuid"] = jsonObject["id"]
			device["interfaces"] = []
			device["vncPort"] = 5900 + deviceIndex
			deviceIndex += 1

			# manually create em0 and em1 interfaces			
			em0 = {}
			em0["mac"] = generateNextMac()
			em0["bridge"] = "virbr0"
			em0["slot"] = "0x04"
			em1 = {}
			em1["mac"] = generateNextMac()
			em1["bridge"] = "em1bridge"
			em1["slot"] = "0x05"

			device["interfaces"].append(em0)
			device["interfaces"].append(em1)

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
	em1bridge["name"] = "em1bridge"
	em1bridge["mac"] = generateNextMac()
	networks.append(em1bridge)

	for jsonObject in jsonData:
		if jsonObject["type"] == "draw2d.Connection":
			targetUUID = jsonObject["target"]["node"]
			sourceUUID = jsonObject["source"]["node"]
			for d in devices:
				if d["uuid"] == sourceUUID:
					# slot should always start with 4
					slot = "%#04x" % int(len(d["interfaces"]) + 4)
					interface = {}
					interface["mac"] = generateNextMac()
					interface["bridge"] = "br" + str(connIndex)
					interface["slot"] = slot
					interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
					d["interfaces"].append(interface)

				elif d["uuid"] == targetUUID:
					# slot should always start with 4
					slot = "%#04x" % int(len(d["interfaces"]) + 4)
					interface = {}
					interface["mac"] = generateNextMac()
					interface["bridge"] = "br" + str(connIndex)
					interface["slot"] = slot
					interface["name"] = "ge-0/0/" + str(len(d["interfaces"]))
					d["interfaces"].append(interface)


			connection = {}
			connection["name"] = "br" + str(connIndex)
			connection["mac"] = generateNextMac()
			networks.append(connection)
			connIndex += 1

	returnObject = {}
	returnObject["networks"] = networks
	returnObject["devices"] = devices
	return returnObject


