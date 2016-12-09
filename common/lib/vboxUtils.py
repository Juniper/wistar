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

# 10-24-14 nembery
import logging
import virtualbox

from wistar import configuration

logger = logging.getLogger(__name__)
vbox_session = ""


def init_session():
    global vbox_session
    if vbox_session == "":
        vbox_session = virtualbox.VirtualBox()


def get_vm_host_only_net_name(host_only_net_ip_address):
    from vbhonetutil import VBHONetUtil
    host_only_net_name = configuration.virtual_box_host_only_net_name
    if host_only_net_ip_address is not None:
        host_only_network_util = VBHONetUtil()
        host_only_net_name = host_only_network_util.getHostOnlyNetworkNameByGuestIP(host_only_net_ip_address)
    logger.debug(" get_vm_host_only_net_name():  %s ==> %s" % (host_only_net_ip_address, host_only_net_name))
    return host_only_net_name


def get_instance(name):
    init_session()
    instance = vbox_session.find_machine(name)
    return instance


def get_vm_session(name):
    try:
        m = get_instance(name)
        session = m.create_session()
        instance = session.machine
        return session, instance
    except Exception:
        logger.debug("Could not get VM Session")
        return None


def save_session(session, instance):
    try:
        instance.save_settings()
        session.unlock_machine()
        return True
    except Exception:
        logger.debug("Could not save session")
        # try to unlock again!
        session.unlock_machine()
        return False


def preconfigure_vmx(name, mgmtipaddr):
    (session, instance) = get_vm_session(name)
    if not remove_extraneous_controllers(instance):
        session.unlock_machine()
        return False

    if not set_serial_port_as_server(instance):
        session.unlock_machine()
        return False

    if not set_management_network(instance, mgmtipaddr):
        session.unlock_machine()
        return False

    return save_session(session, instance)


def remove_extraneous_controllers(instance):
    try:
        controllers = instance.storage_controllers
        for c in controllers:
            if c.name != "IDE Controller":
                logger.debug("Removing " + str(c.name))
                instance.remove_storage_controller(c.name)

        return True
    except Exception:
        logger.debug("Could not modify controllers")
        return False


# get the first interface and set it to be a host only network called vboxnet0
def set_management_network(instance, mgmtipaddr):
    try:
        iface = instance.get_network_adapter(0)
        iface.enabled = True
        # iface.host_only_interface = 'vboxnet0'
        iface.host_only_interface = get_vm_host_only_net_name(mgmtipaddr)
        iface.attachment_type = virtualbox.library.NetworkAttachmentType(4)
        return True
    except Exception:
        logger.debug("Could not set managment network on first interface")
        return False


# get the first serial port
# and set it to 'create' by default
def set_serial_port_as_server(instance):
    try:
        sp = instance.get_serial_port(0)

        if sp.server is True:
            return True

        sp.server = True
        return True
    except Exception:
        logger.debug("Could not set serial port pipe")
        return False
