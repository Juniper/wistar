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
import re
import socket
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
        # logger.debug("IP Exists and is pingable")
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


# creates a thinly provisioned instance of the given image
# *If on KVM, otherwise, clone the full hd for virtualbox
def create_thick_provision_instance(image, instance, resize):
    instance_file = get_instance_path_from_image(image, instance)

    shutil.copy(image, instance_file)
    logger.debug("copied image to thick provisioned image and ready to go")
    try:
        resize_str = str(resize)
    except ValueError:
        logger.error('Could not create a string value from resize! Using default value of 20')
        resize_str = "20"

    rv = os.system("qemu-img resize '" + instance_file + "' +" + resize_str + "G")
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


def create_config_drive(domain_name, files=[]):
    """
    Create config drive disk image for the given domain.
        - Creates a temporary mount location in the seeds directory
        - Creates a directory in the seeds location for this domain
        - Creates a raw disk image in the domains seed directory
        - Mounts the disk image
        - Formats as msdos (FIXME - this should be configurable to allow for ISO format)
        - Creates the approporate directory structure
        - Writes all files in the files list
    :param domain_name: name of the domain for this config drive
    :param files: list of dicts indexed by filename, value is the contents of the file to be written
    :return: full path to the completed config-drive.img file for this domain
    """

    mnt_dir = configuration.seeds_dir + "mnt"
    staging_dir = configuration.seeds_dir + "staging"

    try:
        seed_dir = configuration.seeds_dir + domain_name
        seed_img_name = seed_dir + "/config-drive.img"

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        if not check_path(mnt_dir):
            os.mkdir(mnt_dir)

        if not check_path(staging_dir):
            os.mkdir(staging_dir)

        if check_path(seed_img_name):
            logger.debug("seed.img already created!")
            return seed_img_name

        if not os.system("qemu-img create -f raw  %s 16M" % seed_img_name) == 0:
            raise Exception("Could not create config-drive image")

        if not os.system("mkdosfs %s" % seed_img_name) == 0:
            raise Exception("Could not create config-drive filesystem")

        for name in files:

            if '/' in name:
                # we need to create a directory structure here!
                directory = os.path.dirname(name)
                if not os.system("mkdir -p %s%s" % (staging_dir, directory)) == 0:
                    raise Exception("Could not create confg-drive directory structure")
            else:
                # ensure a leading / just in case!
                name = "/" + name

            logger.debug("writing file: %s" % name)
            with open("%s%s" % (staging_dir, name), "w") as mdf:
                mdf.write(files[name])

        os.system("cd %s && tar -cvf vmm-config.tar ." % staging_dir)

        # copy files using mcopy (requires mtools to be installed)
        if not os.system("mcopy -s -i %s %s/* ::/" % (seed_img_name, staging_dir)) == 0:
            # if mcopy fails, try mounting the drive (requires root)
            if not os.system("mount %s %s" % (seed_img_name, mnt_dir)) == 0:
                raise Exception("Could not mount config-drive filesystem")
            if not os.system("cp -r %s/* %s" % (staging_dir, mnt_dir)) == 0:
                raise Exception("Could not copy files to config-drive")
            os.system("umount %s" % mnt_dir)

        # cleanup staging directory
        if not os.system("rm -r %s" % staging_dir) == 0:
            raise Exception("Could not clear staging directory")

        return seed_img_name

    except Exception as e:
        logger.debug("Could not create_config_drive!!!")
        logger.debug(str(e))
        return None


def compile_config_drive_params_template(template_name, domain_name, host_name, password, ip, management_interface):
    """

    :param template_name: name of a template to compile - must exist in the common/templates directory
    :param domain_name: name of the domain to which this template will be attached
    :param host_name: hostname to use in generated templates (if needed)
    :param password: user password to use if needed
    :param ip: management ip address to use in generated template
    :param management_interface: management interface name to use (eth0, fxp0, em0, etc)
    :return: compiled template as String or None on error
    """
    logger.debug("Compiling template %s" % template_name)
    try:
        # read template
        this_path = os.path.abspath(os.path.dirname(__file__))
        template_path = os.path.abspath(os.path.join(this_path, "../templates/%s" % template_name))

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

        # do not allow 'root' user as the default ssh_user as this causes Junos configuration errors
        if configuration.ssh_user == 'root':
            configuration.ssh_user = 'wistar'

        config["ssh_user"] = configuration.ssh_user
        config["password"] = password
        config["mgmt_interface"] = management_interface

        template_data_string = template_data.render(config=config)
        logger.debug(template_data_string)

        seed_dir = configuration.seeds_dir + domain_name

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        return template_data_string

    except OSError as oe:
        logger.error("Could not open template file with name: %s" % template_name)
        logger.info(str(oe))
        return None
    except Exception as e:
        logger.debug("Caught exception in compile_config_drive_params_template " + str(e))
        return None


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

        # do not allow 'root' user as the default ssh_user as this causes Junos configuration errors
        if configuration.ssh_user == 'root':
            configuration.ssh_user = 'wistar'

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
        logger.debug("Caught exception in get_junos_default_config_template " + str(e))
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
        "name": "vmx01"
    }
    """
    dhcp_hosts_file_path = "/var/lib/libvirt/dnsmasq/default.hostsfile"

    if not os.path.exists(dhcp_hosts_file_path):
        return []

    # basic strategy is to pull all entries into an array unless the line matches our mac!
    entries = []
    with open(dhcp_hosts_file_path, 'r') as hosts_file:
        for entry in hosts_file:
            e = entry.strip().split(',')
            m = e[0]
            i = e[1]
            if len(e) == 3:
                n = e[2]
            else:
                n = ''
            entry_object = dict()
            entry_object["ip-address"] = i
            entry_object["mac-address"] = m
            entry_object['name'] = n
            entries.append(entry_object)

    return entries


def check_port_in_use(port_number):
    s = socket.socket()

    try:
        s.connect(('127.0.0.1', int(port_number)))
        logger.info("port %s is taken by another process!" % port_number)
        return True
    except socket.error:
        logger.info("port %s is available" % port_number)
        return False


def get_used_ports():
    """
    Shell out to get all TCP ports that are in the listening state
    useful to determining an open port to use for proxy configurations
    :return:
    """
    cmd = "netstat -plant 2>/dev/null| awk '{ print $4 }' | cut -d':' -f2  | egrep '^[0-9]' | sort -un"
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()
    return o


def get_active_proxies():
    cmd = "ps -ef | grep wistar_proxy | grep -v grep"
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()

    pattern = '^.+?\s+([0-9]+).+local-port=(.*?) .+remote-ip=(.*?) .+remote-port=(.*)'
    r = re.compile(pattern)
    proxies = list()

    for l in o.split('\n'):
        m = r.match(l)
        if m:
            proxy_config = dict()
            proxy_config['pid'] = m.group(1)
            proxy_config['local_port'] = m.group(2)
            proxy_config['remote_ip'] = m.group(3)
            proxy_config['remote_port'] = m.group(4)
            proxies.append(proxy_config)

    return proxies


def kill_pid(pid):
    """
    kills the selected pid
    :param pid:
    :return:
    """

    try:
        ints_only_please = int(pid)
    except ValueError:
        logger.warn('Bad input to kill_pid, ints only please!')
        return

    cmd = "kill %s" % ints_only_please
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()
    return o
