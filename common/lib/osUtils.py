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

import json
import logging
import os
import platform
import shutil
import subprocess

from jinja2 import Environment
from netaddr import *

from wistar import configuration
from wistar import settings

logger = logging.getLogger(__name__)


# used to determine if we should try kvm or virtualbox
# if Linux, then KVM, otherwise, we'll fallback to VirtualBox if possible
def check_is_linux():
    if os.uname()[0] == "Linux":
        return True
    else:
        return False


def check_is_ubuntu():
    dist = platform.dist()[0]
    if "buntu" in dist:
        return True
    else:
        return False


# silly wrapper
def check_path(path):
    if os.path.exists(path):
        return True
    else:
        return False


# on linux, let's verify if a process is running
# used to check on libvirtd process status
def check_process(process_name):
    cmd = "ps aux"
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()
    if process_name in o:
        return True
    else:
        return False


def check_ip(ip_address):
    """
    check to see if the given ip address is already reachable
    :param ip_address: IP address to check
    :returns: True if reachable, False otherwise
    """

    rv = os.system("ping -c 1 -q %s " % ip_address)
    if rv == 0:
        logger.debug("IP Exists and is pingable")
        return True
    else:
        return False


# returns the full path and filename of an image instance
def get_instance_path_from_image(image, instance):
    return os.path.dirname(image) + "/instances/" + instance + ".img"


# takes an images path and an instance name
def check_image_instance(image, instance):
    i = get_instance_path_from_image(image, instance)
    return check_path(i)


def copy_image_to_clone(old_path, new_path):
    try:
        shutil.copy(old_path, new_path)
        return True
    except Exception as e:
        logger.debug(str(e))
        return False


# creates a thinly provisioned instance of the given image
# *If on KVM, otherwise, clone the full hd for virtualbox
def create_thin_provision_instance(image, instance):
    instance_file = get_instance_path_from_image(image, instance)
    if configuration.deployment_backend == "virtualbox":
        rv = os.system("vboxmanage clonehd '" + image + "' '" + instance_file + "'")
    else:
        # assume kvm
        rv = os.system("qemu-img create -b '" + image + "' -f qcow2 '" + instance_file + "'")

    if rv == 0:
        return True
    else:
        return False


def convert_vmdk_to_qcow2(image_path, new_image_path):

    rv = os.system("qemu-img convert -f vmdk -O qcow2 %s %s" % (image_path, new_image_path))

    if rv == 0:
        return True
    else:
        return False


# creates a new blank image
# useful for installing from ISO files
def create_blank_image(filename, size):
    if configuration.deployment_backend == "kvm":
        rv = os.system("qemu-img create '" + filename + "' -f qcow2 " + size)
    else:
        logger.debug("Only KVM backend is supported for this function")
        rv = 1

    if rv == 0:
        return True
    else:
        return False


# simple wrapper around os library
# should provide additional functionality for vBox environments
def list_dir(directory):
    if os.path.isdir(directory):
        return os.listdir(directory)
    else:
        return []


def is_image_thin_provisioned(image_path):
    """
    Check to see if the qemu-img info command reports a backing file
    :param image_path: full path to an image to check
    :return: boolean
    """
    if configuration.deployment_backend == "kvm":
        rv = os.system("qemu-img info " + image_path + " | grep backing")
        if rv == 0:
            logger.debug("Found a backing file!")
            return True
        else:
            return False
    else:
        # non kvm based deployments (i.e. virtualbox) will never have a backing file
        return False


def remove_instance(instance_path):
    rv = 0
    if configuration.deployment_backend == "kvm":
        if os.path.exists(instance_path):
            os.remove(instance_path)

    elif configuration.deployment_backend == "virtualbox":
        rv = os.system("vboxmanage closemedium disk \"" + instance_path + "\" --delete")

    else:
        logger.debug("configured deployment backend %s is not yet implemented!" % configuration.deployment_backend)
        return False

    if rv == 0:
        return True
    else:
        return False


def remove_instances_for_topology(topology_id_prefix):
    directory = settings.MEDIA_ROOT + "/user_images/instances"
    logger.debug("Deleting for topology_id_prefix %s" % topology_id_prefix)
    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        if entry.startswith(topology_id_prefix):
            logger.debug(entry)
            logger.debug(directory)
            logger.debug(full_path)
            logger.debug("Removing stale entry: " + full_path)
            os.remove(full_path)


def create_cloud_drive(domain_name, files=[]):
    try:
        seed_dir = configuration.seeds_dir + domain_name
        seed_img_name = seed_dir + "/config-drive.img"

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        if check_path(seed_img_name):
            logger.debug("seed.img already created!")
            return seed_img_name

        if not os.system("qemu-img create -f raw  %s 16M" % seed_img_name) == 0:
            raise Exception("Could not create config-drive image")

        if not os.system("mkdosfs %s" % seed_img_name) == 0:
            raise Exception("Could not create config-drive filesystem")

        if not os.system("mount %s /mnt" % seed_img_name) == 0:
            raise Exception("Could not mount config-drive filesystem")

        for name in files:

            if '/' in name:
                # we need to create a directory structure here!
                directory = os.path.dirname(name)
                if not os.system("mkdir -p /mnt%s" % directory) == 0:
                    raise Exception("Could not create confg-drive directory structure")
            else:
                # ensure a leading / just in case!
                name = "/" + name

            logger.debug("writing file: %s" % name)
            with open("/mnt%s" % name, "w") as mdf:
                mdf.write(files[name])

        os.system("cd /mnt && tar -cvf vmm-config.tar .")

        return seed_img_name

    except Exception as e:
        logger.debug("Could not create_cloud_drive!!!")
        logger.debug(str(e))
        return None

    finally:
        os.system("umount /mnt")


def get_junos_default_config_template(domain_name, host_name, password, ip, management_interface):
    try:
        # read template
        this_path = os.path.abspath(os.path.dirname(__file__))
        template_path = os.path.abspath(os.path.join(this_path, "../templates/junos_config.j2"))

        template = open(template_path)
        template_string = template.read()
        template.close()

        env = Environment()
        template_data = env.from_string(template_string)

        ip_network = IPNetwork(configuration.management_subnet)

        config = dict()
        config["domain_name"] = domain_name
        config["host_name"] = host_name
        config["mgmt_ip"] = ip + "/" + str(ip_network.prefixlen)
        config["mgmt_gateway"] = configuration.management_gateway
        config["ssh_key"] = configuration.ssh_key
        config["ssh_user"] = configuration.ssh_user
        config["password"] = password
        config["mgmt_interface"] = management_interface

        template_data_string = template_data.render(config=config)
        logger.debug(template_data_string)

        seed_dir = configuration.seeds_dir + domain_name

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        return template_data_string

    except Exception as e:
        logger.debug("Caught exception in create_cloud_init_img " + str(e))
        return None


def create_cloud_init_img(domain_name, host_name, mgmt_ip, mgmt_interface, password, script="", script_param=""):
    try:
        seed_dir = configuration.seeds_dir + domain_name
        seed_img_name = seed_dir + "/seed.iso"

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        if check_path(seed_img_name):
            logger.debug("seed.img already created!")
            return seed_img_name

        # read template
        this_path = os.path.abspath(os.path.dirname(__file__))
        meta_data_template_path = os.path.abspath(os.path.join(this_path, "../templates/cloud_init_meta_data"))
        user_data_template_path = os.path.abspath(os.path.join(this_path, "../templates/cloud_init_user_data"))

        logger.debug(meta_data_template_path)

        logger.debug(user_data_template_path)

        meta_data_template = open(meta_data_template_path)
        meta_data_template_string = meta_data_template.read()
        meta_data_template.close()

        if script == "":
            user_data_template = open(user_data_template_path)
            user_data_template_string = user_data_template.read()
            user_data_template.close()
        else:
            user_data_template_string = script

        env = Environment()
        meta_data = env.from_string(meta_data_template_string)
        user_data = env.from_string(user_data_template_string)

        ip_network = IPNetwork(mgmt_ip)

        config = dict()
        config["domain_name"] = domain_name
        config["hostname"] = host_name
        config["ip_address"] = ip_network.ip.format()
        config["broadcast_address"] = ip_network.broadcast.format()
        config["network_address"] = ip_network.network.format()
        config["netmask"] = ip_network.netmask.format()
        config["mgmt_interface"] = mgmt_interface
        config["default_gateway"] = configuration.management_gateway
        config["ssh_key"] = configuration.ssh_key
        config["ssh_user"] = configuration.ssh_user
        config["password"] = password

        if script_param != "":
            config["param"] = script_param

        meta_data_string = meta_data.render(config=config)
        user_data_string = user_data.render(config=config)

        logger.debug("writing meta-data file")
        mdf = open(seed_dir + "/meta-data", "w")
        mdf.write(meta_data_string)
        mdf.close()

        logger.debug("writing user-data file")
        udf = open(seed_dir + "/user-data", "w")
        udf.write(user_data_string)
        udf.close()

        rv = os.system(
                'genisoimage -output {0} -volid cidata -joliet -rock {1}/user-data {2}/meta-data'.format(seed_img_name,
                                                                                                         seed_dir,
                                                                                                         seed_dir))
        if rv != 0:
            logger.debug("Could not create iso image!")
            return None

        return seed_img_name

    except Exception as e:
        logger.debug("Caught exception in create_cloud_init_img " + str(e))
        return None


def remove_cloud_init_tmp_dirs(topology_prefix):
    logger.debug("deleting cloud config drive for %s" % topology_prefix)
    seed_dir = configuration.seeds_dir
    dirs = os.listdir(seed_dir)
    try:
        for d in dirs:
            full_path = os.path.join(seed_dir, d)
            logger.debug("checking %s" % d)
            if topology_prefix in d and os.path.isdir(full_path):
                logger.debug("we found a domain config dir at %s" % full_path)
                for f in os.listdir(full_path):
                    logger.debug("deleting cloud-init file: %s" % f)
                    os.remove(os.path.join(full_path, f))

                logger.debug("removing dir %s" % d)
                os.rmdir(full_path)

    except Exception as e:
        # smother error
        logger.debug(str(e))


def remove_cloud_init_seed_dir_for_domain(domain_name):
    try:
        logger.debug("deleting cloud config drive for %s" % domain_name)
        seed_dir = configuration.seeds_dir + domain_name
        logger.debug(seed_dir)
        if os.path.isdir(seed_dir):
            for f in os.listdir(seed_dir):
                logger.debug("deleting cloud-init file: %s" % f)
                os.remove(os.path.join(seed_dir, f))

            os.rmdir(seed_dir)
    except Exception as e:
        logger.debug("Got an error deleting cloud-init dir: %s" % e)


def get_image_size(image_path):
    cmd = "du -b %s | awk '{ print $1 }'" % image_path
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()
    return o


def get_dhcp_leases():
    """
    The leases file is kept as a list of JSON objects:
    {
        "ip-address": "192.168.122.171",
        "mac-address": "52:54:00:00:42:00",
        "hostname": "uuu01",
        "expiry-time": 1474921933
    },
    :return: python list of lease objects
    """
    leases_file_path = "/var/lib/libvirt/dnsmasq/virbr0.status"

    if not os.path.exists(leases_file_path):
        return []

    with open(leases_file_path) as leases_file:
        all_leases = leases_file.read()
        if len(all_leases) > 0:
            return json.loads(all_leases)
        else:
            return []


def get_dhcp_reservations():
    """
    Return all current reservations as a list of json objects
    :return: list of objects in this format:
    {
        "ip-address": "192.168.122.171",
        "mac-address": "52:54:00:00:42:00",
    }
    """
    dhcp_hosts_file_path = "/var/lib/libvirt/dnsmasq/default.hostsfile"

    if not os.path.exists(dhcp_hosts_file_path):
        return []

    # basic strategy is to pull all entries into an array unless the line matches our mac!
    entries = []
    with open(dhcp_hosts_file_path, 'r') as hosts_file:
        for entry in hosts_file:
            (m, i) = entry.strip().split(',')
            entry_object = dict()
            entry_object["ip-address"] = i
            entry_object["mac-address"] = m
            entries.append(entry_object)

    return entries


def verify_dhcp_reservation(mac, ip):

    dhcp_hosts_file_path = "/var/lib/libvirt/dnsmasq/default.hostsfile"

    host_entries = get_dhcp_reservations()
    for entry in host_entries:
        (entry_mac, entry_ip) = entry.split(',')
        if entry_ip == ip and entry_mac == mac:
            logger.debug("management ip already reserved for this mac")
            return True

    with open(dhcp_hosts_file_path, 'a') as hosts_file:
        hosts_file.write("%s,%s\n" % (mac, ip))

    return True


def reserve_management_ip_for_mac(mac, ip):
    """
    DEPRECATED - use libvirtUtils.reserve_management_ip_for_mac instead
    Open the libvirt dnsmasq dhcp-hosts file and add an entry for the mac / ip combo if it's
    not already there
    :param mac: mac address of the management interface
    :param ip: desired IP address - presumably this has already been vetted as not in use
    :return: boolean true if the configuration has changed!
    """
    dhcp_hosts_file_path = "/var/lib/libvirt/dnsmasq/default.hostsfile"

    if not os.path.exists(dhcp_hosts_file_path):
        return False

    with open(dhcp_hosts_file_path, 'r') as hosts_file:
        for entry in hosts_file:
            (entry_mac, entry_ip) = entry.split(',')
            if entry_ip == ip and entry_mac == mac:
                logger.debug("management ip already reserved for this mac")
                return False
            elif entry_ip == ip and entry_mac != mac:
                logger.debug("management ip Already in Use!")
                return False
            elif entry_ip != ip and entry_mac == mac:
                logger.debug("management interface mac is already configured!")
                return False

    with open(dhcp_hosts_file_path, 'a') as hosts_file:
        hosts_file.write("%s,%s\n" % (mac, ip))

    return True


def release_management_ip_for_mac(mac):
    """
    DEPRECATED - use libvirtUtils.release_management_ip_for_mac instead
    Open the libvirt dnsmasq dhcp-hosts file and remove an entry for the mac / ip combo if it's
    not already there
    :param mac: mac address of the management interface
    :param ip: desired IP address - presumably this has already been vetted as not in use
    :return: boolean
    """
    dhcp_hosts_file_path = "/var/lib/libvirt/dnsmasq/default.hostsfile"

    if not os.path.exists(dhcp_hosts_file_path):
        return False

    # basic strategy is to pull all entries into an array unless the line matches our mac!
    entries = []
    found = False
    with open(dhcp_hosts_file_path, 'r') as hosts_file:
        for entry in hosts_file:
            (m, i) = entry.strip().split(',')
            if m == mac:
                logger.debug("Removing management ip: %s reserved for mac: %s" % (i, m))
                found = True
                continue
            else:
                entries.append(entry.strip())

    if found:
        with open(dhcp_hosts_file_path, 'w') as hosts_file:
            for entry in entries:
                hosts_file.write("%s\n" % entry)

        return True

    return False


def reload_dhcp_config():
    """
    sends a HUP to the dnsmasq process
    :return: boolean
    """
    logger.debug("Sending HUP to dnsmsq processes")
    cmd = 'ps -ef | grep dnsmasq | grep default.conf | awk \'{ print $2 }\' | xargs -n 1 kill -HUP'
    logger.debug("Running cmd: " + cmd)
    rt = os.system(cmd)
    if rt == 0:
        return True
    else:
        return False
