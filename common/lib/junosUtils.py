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

    return pushConfigElement(xmlData, dev)    


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

    return setAllInterfaceMac(dev, interfaces)

# push random config to the device
# let pyez figure out what format it is in
# used by configTemplates from user that can be in any format
def pushConfig(conf_string, ip, pw):
    dev = getDeviceReference(ip, "root", pw)

    # try to determine the format of our config_string
    format = 'set'
    if re.search(r'^\s*<.*>$', conf_string, re.MULTILINE):
        format = 'xml'
    elif re.search(r'^\s*(set|delete|replace|rename)\s', conf_string):
        format = 'set'
    elif re.search(r'^[a-z:]*\s*\w+\s+{', conf_string, re.I) and re.search(r'.*}\s*$', conf_string):
        format = 'text'

    print "using format: " + format
    try:
        cu = Config(dev)
        cu.lock
        cu.load(conf_string, format=format)
        diff = cu.diff()
        print diff
        if diff is not None:
            print "Committing"
            if cu.commit_check():
                print "Committing config!"
                cu.commit(comment="Commit via wistar")
                time.sleep(3)
                return True
        else:
            # nothing to commit
            print "Nothing to commit - no diff found"
            return True
    except CommitError as ce:
        print "Could not load config!"
        cu.rollback()
        print repr(ce)
        return False

    except RpcError as e:
        print "caught exception pushing config"
        print repr(e)
        return False

def pushConfigElement(xmlData, dev, overwrite=False):
    print etree.tostring(xmlData, pretty_print=True)
    try:
        cu = Config(dev)
        cu.lock
        cu.load(xmlData, overwrite=overwrite)
        diff = cu.diff()
        print diff
        if diff is not None:
            print "Committing"
            if cu.commit_check():
                print "Committing config!"
                cu.commit(comment="Commit via wistar")
                time.sleep(3)
                return True
        else:
            # nothing to commit
            print "Nothing to commit - no diff found"
            return True
    except CommitError as ce:
        print "Could not load config!"
        cu.rollback()
        print repr(ce)
        return False

    except RpcError as e:
        print "caught exception pushing config"
        print repr(e)
        return False

def pushConfigString(xmlString, ip, pw):
    print "Pushing new config to " + str(ip)
    print xmlString
    dev = getDeviceReference(ip, "root", pw)
    xmlData = etree.fromstring(xmlString)
    pushConfigElement(xmlData, dev, True)

def getConfig(ip, pw):
    dev = getDeviceReference(ip, "root", pw)
    xml = dev.execute("<get-config><source><running/></source></get-config>") 
    configElement = xml.find('configuration')
    return etree.tostring(configElement)
