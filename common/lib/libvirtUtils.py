import libvirt
import sys
from lxml import etree

conn = None
isInit = False

# FIXME - improve error handling here... lots of catching and smothering exceptions...

# FIXME - should be global setting
debug = True

def connect():
    global isInit
    global conn
    if isInit == True:
        return True
    else:
        conn = libvirt.open(None)
        if conn == None:
            return False
        else:
            isInit = True
            return True

def close():
    if isInit == True:
        conn.close()
        isInit = False

def getNetworkByName(networkName):
    if not connect():
        return False

    try:
        return conn.networkLookupByName(networkName)

    except Exception as e:
        return None

def getDomainByUUID(domainId):
    if not connect():
        return False

    try:
        return conn.lookupByUUIDString(domainId)

    except Exception as e:
        return None

def domainExists(domainName):
    if not connect():
        return False

    try:
        domains = conn.listAllDomains(0)
        for d in domains:
            if d.name() == domainName:
                return True

        return False

    except Exception as ee:
        print repr(e)
        return False

def getDomainByName(domainName):
    """ Get single domain by name """
    if not connect():
        return False

    try:
        domains = conn.listAllDomains(0)
        for d in domains:
            if d.name() == domainName:
                return d

        return False

    except Exception as ee:
        print repr(e)
        return False

def listDomains():
    """ Get all domains """
    if not connect():
        return False

    domainList = []
    try:
        domains = conn.listAllDomains(0)
        for d in domains:
            domain = {}
            domain["name"] = d.name()
            domain["id"] = d.ID()
            domain["uuid"] = d.UUIDString()
            if d.info()[0] == 1:
                domain["state"] = "running"
            else:
                domain["state"] = "shut off"
            domainList.append(domain)

        domainList.sort(key=lambda k: k["name"])
        return domainList
    except Exception as e:
        print repr(e)
        return None

def getDomainsForTopology(topoId):
    """ Get all domains for a given topology Id """
    if not connect():
        return False

    domainList = []
    try:
        domains = listDomains()
        for d in domains:
            if d["name"].startswith(topoId):
                domainList.append(d)
    
        return domainList
    except Exception as e:
        print repr(e)
        return None

def networkExists(networkName):
    if not connect():
        return False

    networkList = []
    try:
        networks = conn.listAllNetworks(0)
        for n in networks:
            if n.name() == networkName:
                return True

        return False

    except Exception as e:
        print repr(e)
        return False


def listNetworks():
    if not connect():
        return False

    networkList = []
    try:
        networks = conn.listAllNetworks(0)
        for n in networks:
            network = {}
            network["name"] = n.name()
            network["uuid"] = n.UUID()
            if n.isActive() == 1:
                network["state"] = "running"
            else:
                network["state"] = "shut off"
            networkList.append(network)
    
        networkList.sort(key=lambda k: k["name"])
        return networkList
    except Exception as e:
        return None

def getNetworksForTopology(topoId):
    """ Get Networks for a given topology Id """
    if not connect():
        return False

    networkList = []
    try:
        networks = listNetworks()
        for n in networks:
            if n["name"].startswith(topoId):
                networkList.append(n)

        return networkList
    except Exception as e:
        return None

# blow away everything and start from scratch!
def resetKvm():
    domains = listDomains()
    networks = listNetworks()
    for n in networks:
        if n["name"] != "default":
            network = getNetworkByName(n["name"])
            if network.isActive() == 1:
                network.destroy()

            network.undefine()

    for d in domains:
        domain = getDomainByUUID(d["uuid"])
        if domain.info()[0] == 1:
            domain.destroy()
        domain.undefine()


# defines domain from supplied xml file. use wistarUtils to create said XML
def defineDomainFromXml(xml):
    if not connect():
        return False

    try:
        domain = conn.defineXML(xml)
        if debug:
            print "Defined Domain: " + domain.name()

        return domain
    except Exception as e:
        if debug:
            print "Could not define domain from xml!"
        return False


def defineNetworkFromXml(xml):
    if not connect():
        return False

    try:
        network = conn.networkDefineXML(xml)
        if debug:
            print "Defined Network: " + network.name()

        return network 
    except Exception as e:
        if debug:
            print "Could not define network from xml!"
        return False

def undefineDomain(domainId):
    if not connect():
        return False

    try:
        domain = getDomainByUUID(domainId)
        domain.undefine()
        return True

    except Exception as e:
        return False

def stopDomain(domainId):
    if not connect():
        return False

    try:
        domain = getDomainByUUID(domainId)
        domain.destroy()
        return True

    except Exception as e:
        return False

def startDomain(domainId):
    if not connect():
        return False

    try:
        domain = getDomainByUUID(domainId)
        if domain.info()[0] != 1:
            domain.create()
        return True

    except:
        return False

def startDomainByName(domainName):
    try:
        d = getDomainByName(domainName)
        if d.info()[0] != 1:
            d.create()
    
        return True
    
    except:
        return False
    
def undefineNetwork(networkName):
    if not connect():
        return False

    # cannot delete default domain!
    if networkName == "default":
        return False

    try:
        network = getNetworkByName(networkName)
        network.undefine()
        return True

    except Exception as e:
        return False

def stopNetwork(networkName):
    if not connect():
        return False

    # cannot delete default domain!
    if networkName == "default":
        return False

    try:
        network = getNetworkByName(networkName)
        network.destroy()
        return True

    except Exception as e:
        return False

def startNetwork(networkName):
    print "LU start network " + str(networkName)
    if not connect():
        return False

    # cannot delete default domain!
    if networkName == "default":
        return False

    try:
        network = getNetworkByName(networkName)
        print "LU we have the network " + str(network.isActive())
        if network.isActive() != 1:
            network.create()
        return True

    except Exception as e:
        return False


# simple func to ensure we always use a valid vncPort
def getNextDomainVncPort():
    if not connect():
        return False

    usedPorts = []
    domains = conn.listAllDomains(0)
    for d in domains:
        xml = d.XMLDesc(0)
        xmlDocument = etree.fromstring(xml)
        graphicsElement = xmlDocument.find(".//graphics")
        if graphicsElement is not None:
            graphicsType = graphicsElement.get("type")
            if graphicsType == "vnc":
                vncPort = graphicsElement.get("port") 
		print "Found vncPort: " + str(vncPort)
                usedPorts.append(int(vncPort))

    if len(usedPorts) > 1:
        usedPorts.sort()
        last = usedPorts[0]
        for p in usedPorts:
            if (p - last) > 1:
                return p + 1
            else:
                last = p

        return last + 1 
    else:
        return 5900

def getImageForDomain(domainId):
    domain = getDomainByUUID(domainId)
    xml = domain.XMLDesc(0)
    xmlDocument = etree.fromstring(xml)
    sourceElement = xmlDocument.find(".//source")
    if sourceElement is not None:
        sourceFile = sourceElement.get("file")
        return sourceFile
    else:
        return None
