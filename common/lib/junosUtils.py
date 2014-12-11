from jnpr.junos import Device
from jnpr.junos.utils.config import Config
from jnpr.junos.exception import *
from wistarException import wistarException
from lxml import etree
import re
import time

def getDeviceReference(host, user, pw):
    try:
        dev = Device(host=host, user=user, password=pw)
        dev.open(gather_facts=False)
        return dev
    except:
        print "Could not connect to device " + str(host) + "!"
        raise wistarException("Could not connect to Device")

def executeCli(ip, pw, cli):
    dev = getDeviceReference(ip, 'root', pw)
    return dev.cli(cli)

def getDeviceEmInterfaceMacs(dev):
    emDict = {}
    interfaces = dev.execute("<get-interface-information></get-interface-information>")
    for physicalInterface in interfaces:
        nameTag = physicalInterface.find(".//name")
        if nameTag is not None:
            name = nameTag.text.strip()
            if re.search("em", name):
                macTag = physicalInterface.find(".//current-physical-address")
                if macTag is not None:
                    mac = macTag.text.strip()
                    emDict[name] = mac

    return emDict


def setAllInterfaceMac(dev, interfaces):
    xmlData = etree.Element("interfaces")
    for i in interfaces:
        ifaceElement = etree.SubElement(xmlData, "interface")
        nameElement = etree.SubElement(ifaceElement, "name")
        nameElement.text = i
        macElement = etree.SubElement(ifaceElement, "mac")
        macElement.text = interfaces[i]

    pushConfigElement(xmlData, dev)    


def getInterfaceIpConfigElement(name, ip):
    try:
        xmlData = etree.Element("interfaces")
        ifaceElement = etree.SubElement(xmlData, "interface")
        nameElement = etree.SubElement(ifaceElement, "name")
        nameElement.text = name
        unitElement = etree.SubElement(ifaceElement, "unit")
        unitNameElement = etree.SubElement(unitElement, "name")
        unitNameElement.text = "0"
        familyElement = etree.SubElement(unitElement, "family")
        inetElement = etree.SubElement(familyElement, "inet")
        inetAddressElement = etree.SubElement(inetElement, "address")
        inetAddressNameElement = etree.SubElement(inetAddressElement, "name")
        inetAddressNameElement.text = ip
    except Exception as e:
        print "Error creating interfaceIpConfig element!"
        print repr(e)
        raise wistarException("Could not create interface configuration")

    return xmlData

# netconf to box and set the address
def setInterfaceIpAddress(deviceIp, pw, name, ifaceIp):
    dev = getDeviceReference(deviceIp, "root", pw)
    xmlData = getInterfaceIpConfigElement(name, ifaceIp)
    return pushConfigElement(xmlData, dev)


# log into each device, get the list of em interfaces
# create the coorresponding ge-0/0/X interfaces
# then netconf in and configure them with appropriate mac appropriately
def configJunosInterfaces(ip, pw):
    interfaces = {}
    # FIXME - move un and pw to config object
    dev = getDeviceReference(ip, "root", pw)
    emInterfaces = getDeviceEmInterfaceMacs(dev)
    # we have the em interfaces with their macs
    # now, lets convert those to ge-0/0/X names ...
    for em in emInterfaces:
        if not em == "em0" and not em  == "em1":
            print "em should not be em0 or em1"
            print em
            emNum = re.sub("\D", "", em)
            print emNum
            geNum = int(emNum) - 2
            print str(geNum)
            ge = "ge-0/0/" + str(geNum)
            # let's grab the mac here
            interfaces[ge] = emInterfaces[em]

    setAllInterfaceMac(dev, interfaces)


def pushConfigElement(xmlData, dev):
    print etree.tostring(xmlData, pretty_print=True)
    try:
        cu = Config(dev)
        cu.lock
        cu.load(xmlData)
        diff = cu.diff()
        print diff
        if diff is not None:
            print "Committing"
            cu.commit()

        time.sleep(2)
        print "Unlocking config"
        try:
            cu.unlock()
        except UnlockError as ue:
            print repr(ue)

        return True
    except RpcError as e:
        print "caught exception pushing config"
        print repr(e)
        return False


def getConfig(ip, pw):
    dev = getDeviceReference(ip, "root", pw)
    return dev.execute("<get-interface-information></get-interface-information>") 
