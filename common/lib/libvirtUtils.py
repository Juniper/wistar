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

import logging

import libvirt
from lxml import etree

from wistar import configuration

logger = logging.getLogger(__name__)

conn = None
is_init = False


def connect():
    """
    connect to libvirt
    must be called before any other calls in this library!
    :return: boolean
    """
    global is_init
    global conn
    if is_init is True:
        return True
    else:
        conn = libvirt.open(None)
        if conn is None:
            raise Exception("Could not connect to hypervisor")
        else:
            is_init = True
            return True


def close():
    """
    close the connection to libvirt
    :return: None
    """
    global is_init
    if is_init is True:
        conn.close()
        is_init = False


def get_network_by_name(network_name):
    connect()

    try:
        return conn.networkLookupByName(network_name)

    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not get network by name")


def get_domain_by_uuid(domain_id):
    connect()

    try:
        return conn.lookupByUUIDString(domain_id)

    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not get domain by uuid")


def domain_exists(domain_name):
    connect()

    try:
        domains = conn.listAllDomains(0)
        for d in domains:
            if d.name() == domain_name:
                return True

        return False

    except Exception as ee:
        logger.debug(repr(ee))
        return False


def promote_instance_to_image(domain_name):
    """
    Takes a domains instance file and performs a
    blockPull operation. This results in the instance file
    being a fully self sustained file that can be used as a
    standalone image

    :param domain_name: domain name string
    :return: None Block already completed
    :return: False Error condition
    :return True Block pull started
    """
    connect()

    try:
        domain = get_domain_by_name(domain_name)
        image_path = get_image_for_domain(domain.UUIDString())

        if domain.blockJobInfo(image_path, 0) != {}:
            logger.debug("block job already in progress")
            return None

        logger.debug("Performing blockPull on " + image_path)
        domain.blockPull(image_path, 0, 0)
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def is_image_in_block_pull(domain, image_path):
    if domain.blockJobInfo(image_path) != {}:
        logger.debug("block job already in progress")
        return True
    else:
        return False


def get_domain_by_name(domain_name):
    """ Get single domain by name """
    connect()

    domains = conn.listAllDomains(0)
    for d in domains:
        if d.name() == domain_name:
            return d

    raise Exception("Could not get domain by name")


def get_domain_dict(domain_name):
    """
    Get a dict containing domain details with the following keys: 'name', 'id', 'uuid', 'state'
    'State' can be 'running' or 'shut off'
    :param domain_name: name of the domain something like 't01_vmx01'
    :return: domain dict
    """
    d = get_domain_by_name(domain_name)
    domain = dict()
    domain["name"] = d.name()
    domain["id"] = d.ID()
    domain["uuid"] = d.UUIDString()
    domain['xml'] = d.XMLDesc(0)
    if d.info()[0] == 1:
        domain["state"] = "running"
    else:
        domain["state"] = "shut off"

    return domain


# convenience function to check if a domain is currently started
def is_domain_running(domain_name):
    try:
        domain = get_domain_by_name(domain_name)

        if domain.info()[0] == 1:
            return True

        return False

    except Exception as e:
        logger.error(str(e))
        return False


def list_domains():
    """ Get all domains """
    connect()

    domain_list = []
    try:
        domains = conn.listAllDomains(0)
        for d in domains:
            domain = dict()
            domain["name"] = d.name()
            domain["id"] = d.ID()
            domain["uuid"] = d.UUIDString()
            if d.info()[0] == 1:
                domain["state"] = "running"
            else:
                domain["state"] = "shut off"
            domain_list.append(domain)

        domain_list.sort(key=lambda k: k["name"])
        return domain_list
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not list domains")


def get_domains_for_topology(topology_id):
    """ Get all domains for a given topology Id """
    connect()

    domain_list = []

    if not str(topology_id).startswith('t'):
        topology_id = 't' + str(topology_id) + '_'

    try:
        domains = list_domains()
        for d in domains:
            if d["name"].startswith(topology_id):
                domain_list.append(d)

        return domain_list
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not list domains")


def undefine_all_in_topology(topology_id):
    network_list = get_networks_for_topology(topology_id)
    for network in network_list:
        logger.debug("Undefining network: " + network["name"])
        undefine_network(network["name"])

    domain_list = get_domains_for_topology(topology_id)
    for domain in domain_list:
        logger.debug("undefining domain: " + domain["name"])
        undefine_domain(domain["uuid"])


def network_exists(network_name):
    connect()

    try:
        networks = conn.listAllNetworks(0)
        for n in networks:
            if n.name() == network_name:
                return True

        return False

    except Exception as e:
        logger.debug(repr(e))
        return False


def list_networks():
    connect()

    network_list = []
    try:
        networks = conn.listAllNetworks(0)
        for n in networks:
            network = dict()
            network["name"] = n.name()
            network["uuid"] = n.UUID()
            if n.isActive() == 1:
                network["state"] = "running"
            else:
                network["state"] = "shut off"
            network_list.append(network)

        network_list.sort(key=lambda k: k["name"])
        return network_list
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not list networks")


def get_networks_for_topology(topology_id):
    """ Get Networks for a given topology Id """
    connect()

    network_list = []

    if not topology_id.startswith("t"):
        topology_id = "t" + topology_id + "_"

    networks = list_networks()
    for n in networks:
        if n["name"].startswith(topology_id):
            network_list.append(n)

    return network_list


# blow away everything and start from scratch!
def reset_kvm():
    domains = list_domains()
    networks = list_networks()
    for n in networks:
        if n["name"] != "default":
            network = get_network_by_name(n["name"])
            if network.isActive() == 1:
                network.destroy()

            network.undefine()

    for d in domains:
        domain = get_domain_by_uuid(d["uuid"])
        if domain.info()[0] == 1:
            domain.destroy()
        domain.undefine()


# defines domain from supplied xml file. use wistarUtils to create said XML
def define_domain_from_xml(xml):
    connect()

    try:
        domain = conn.defineXML(xml)
        logger.debug("Defined Domain: " + domain.name())

        return domain
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not define domain")


def define_network_from_xml(xml):
    connect()

    try:
        network = conn.networkDefineXML(xml)
        logger.debug("Defined Network: " + network.name())

        return network
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Could not define network")


def undefine_domain(domain_id):
    connect()

    try:
        domain = get_domain_by_uuid(domain_id)

        # check if the domain has been paused!
        if domain.hasManagedSaveImage(0):
            logger.info("Removing saved state for domain " + domain.name())
            domain.managedSaveRemove(0)

        if domain.hasCurrentSnapshot():
            logger.info("Removing snapshots for domain " + domain.name())
            snapshots = domain.snapshotListNames()
            for s in snapshots:
                snap = domain.snapshotLookupByName(s)
                snap.delete()

        if domain.info()[0] == 1:
            domain.destroy()

        domain.undefine()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def stop_domain(domain_id):
    connect()

    try:
        domain = get_domain_by_uuid(domain_id)
        domain.destroy()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def suspend_domain(domain_id):
    connect()

    try:
        domain = get_domain_by_uuid(domain_id)
        domain.managedSave(0)
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def start_domain(domain_id):
    connect()

    try:
        domain = get_domain_by_uuid(domain_id)
        if domain.info()[0] != 1:
            domain.create()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def start_domain_by_name(domain_name):
    try:
        d = get_domain_by_name(domain_name)
        if d.info()[0] != 1:
            d.create()

        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def undefine_network(network_name):
    connect()

    # cannot delete default domain!
    if network_name == "default":
        return False

    try:
        network = get_network_by_name(network_name)
        if network.isActive() == 1:
            logger.debug("Stopping network before destroy")
            network.destroy()

        network.undefine()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def stop_network(network_name):
    connect()

    # cannot delete default domain!
    if network_name == "default":
        return False

    try:
        network = get_network_by_name(network_name)
        network.destroy()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def start_network(network_name):
    logger.debug("Starting network " + str(network_name))
    connect()

    # cannot delete default domain!
    if network_name == "default":
        return False

    try:
        network = get_network_by_name(network_name)
        if network.isActive() != 1:
            network.create()
        return True

    except Exception as e:
        logger.debug(str(e))
        return False


def get_domain_vnc_port(domain):
    xml = domain.XMLDesc(0)
    doc = etree.fromstring(xml)
    graphics_el = doc.find(".//graphics")
    if graphics_el is not None:
        graphics_type = graphics_el.get("type")
        if graphics_type == "vnc":
            vnc_port = graphics_el.get("port")
            return vnc_port
        else:
            return 0
    else:
        return 0


# simple func to ensure we always use a valid vnc_port
def get_next_domain_vnc_port(offset=0):
    """
    Returns an port that can be used for VNC console access
    Ensures the port is not currently take by another configured / deployed VM
    or another process on the host machine
    Will begin iterating UP from configured 'vnc_start_port' and return first (or first + offset) port that is
    available
    :param offset: Offset indicates the number of previously found ports that should be considered to be taken
    :return: int
    """
    logger.debug("Getting next vnc port with offset: " + str(offset))
    current_iteration = 0
    connect()

    used_ports = []
    domains = conn.listAllDomains(0)
    for d in domains:
        vnc_port = get_domain_vnc_port(d)
        try:
            port = int(vnc_port)
            if port != 0 and port != -1:
                used_ports.append(port)
        except Exception as e:
            # in some cases,port can be something other than int like None
            # just catch all the here and continue on
            logger.debug("found unhandled error for vnc_port! " + str(vnc_port))
            logger.debug(str(e))
            continue

    if len(used_ports) > 1:
        used_ports.sort()
        logger.debug(str(used_ports))
        last = used_ports[0]
        maximum = used_ports[-1]
        for p in used_ports:

            if (int(p) - int(last)) > 1:
                next_port = int(last) + 1
                if current_iteration == offset:
                    logger.debug("retuning " + str(next_port))
                    return str(next_port)
                else:
                    logger.debug("keep going:" + str(next_port))
                    current_iteration += 1
                    last = p
            else:
                last = p

        # we ran through all the ports and didn't find a gap we can re-use
        next_port = int(maximum) + 1 + int(offset)
        logger.debug("returning max+1+offset: " + str(next_port))
        return next_port
    else:
        print "No vnc ports currently in use"
        # return int(5900) + offset
        return configuration.vnc_start_port + offset


def get_image_for_domain(domain_id):
    """
    :param domain_id: uuid of the domain
    :return: the path to the image file
    """
    domain = get_domain_by_uuid(domain_id)
    xml = domain.XMLDesc(0)
    doc = etree.fromstring(xml)
    source_el = doc.find(".//source")
    if source_el is not None:
        source_file = source_el.get("file")
        return source_file
    else:
        return None


def attach_iso_to_domain(domain_name, file_path):
    try:
        xml = """<disk type='file' device='cdrom'>
          <driver name='qemu' type='raw'/>
          <source file='{0:s}'/>
          <target dev='hdc' bus='ide'/>
          <readonly/>
          <address type='drive' controller='0' bus='0' target='0' unit='1'/>
        </disk>""".format(file_path)

        logger.debug(xml)

        domain = get_domain_by_name(domain_name)
        domain.updateDeviceFlags(xml, libvirt.VIR_DOMAIN_AFFECT_CONFIG)
        return True
    except Exception as e:
        logger.debug(str(e))
        return False


def detach_iso_from_domain(domain_name):
    try:
        xml = """<disk type='file' device='cdrom'>
          <driver name='qemu' type='raw'/>
          <source file=''/>
          <target dev='hdc' bus='ide'/>
          <readonly/>
          <address type='drive' controller='0' bus='0' target='0' unit='1'/>
        </disk>"""

        logger.debug(xml)

        domain = get_domain_by_name(domain_name)
        domain.updateDeviceFlags(xml, libvirt.VIR_DOMAIN_AFFECT_CONFIG)
        return True
    except Exception as e:
        logger.debug(str(e))
        return False


def get_iso_for_domain(domain_name):
    """
    :param domain_name: name of the domain
    :return: the path to the iso file
    """
    try:
        domain = get_domain_by_name(domain_name)
    except Exception as e:
        logger.debug("Domain not configured")
        logger.debug(str(e))
        return None

    xml = domain.XMLDesc(0)
    doc = etree.fromstring(xml)
    source_el = doc.find(".//disk[@device='cdrom']/source")
    if source_el is not None:
        source_file = source_el.get("file")
        return source_file
    else:
        return None


def get_management_interface_mac_for_domain(domain_name):
    try:
        domain = get_domain_by_name(domain_name)
    except Exception as e:
        logger.debug("Domain not configured")
        logger.debug(str(e))
        return None

    xml = domain.XMLDesc(0)
    doc = etree.fromstring(xml)
    mac_el = doc.find(".//interface/source[@bridge='virbr0']/../mac")
    if mac_el is not None:
        mac_address = mac_el.get("address")
        return mac_address
    else:
        return None


def reserve_management_ip_for_mac(mac, ip, device_name):
    """
    n.update(l.VIR_NETWORK_UPDATE_COMMAND_DELETE,  l.VIR_NETWORK_SECTION_IP_DHCP_HOST, -1,
    "<host mac='52:54:00:00:52:02' name='vmx01' ip='192.168.122.87'/>",
    l.VIR_NETWORK_UPDATE_AFFECT_CONFIG | l.VIR_NETWORK_UPDATE_AFFECT_LIVE)
    :param mac: mac address to reserve
    :param ip: ip address to map to the mac address
    :param device_name: name of the device
    :return: boolean on success / fail
    """
    try:
        management_network = get_network_by_name("default")
        xml = "<host mac='{0}' ip='{1}' name='{2}'/>".format(mac, ip, device_name)
        management_network.update(libvirt.VIR_NETWORK_UPDATE_COMMAND_ADD_LAST,
                                  libvirt.VIR_NETWORK_SECTION_IP_DHCP_HOST,
                                  -1,
                                  xml,
                                  libvirt.VIR_NETWORK_UPDATE_AFFECT_CONFIG | libvirt.VIR_NETWORK_UPDATE_AFFECT_LIVE
                                  )
        return True

    except libvirt.libvirtError as e:
        logger.error(e)
        return False


def release_management_ip_for_mac(mac):
    """
    Removes all management network reservations for the given mac address
    :param mac: mac of which to remove
    :return: boolean on success / fail
    """

    try:
        management_network = get_network_by_name("default")
        xml = "<host mac='{0}'/>".format(mac)
        management_network.update(libvirt.VIR_NETWORK_UPDATE_COMMAND_DELETE,
                                  libvirt.VIR_NETWORK_SECTION_IP_DHCP_HOST,
                                  -1,
                                  xml,
                                  libvirt.VIR_NETWORK_UPDATE_AFFECT_CONFIG | libvirt.VIR_NETWORK_UPDATE_AFFECT_LIVE
                                  )
        return True

    except libvirt.libvirtError as e:
        logger.error(e)
        return False
