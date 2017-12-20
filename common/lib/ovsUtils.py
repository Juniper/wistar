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

import os


def ovs_bridge_exists(bridge_name):
    """
    Checks is the bridge exists using ovs-vsctl command
    :param bridge_name: name of the bridge to check
    :return: boolean
    """
    rv = os.system("ovs-vsctl br-exists %s" % bridge_name)
    if rv == 0:
        return True
    else:
        return False


def create_bridge(bridge_name):
    """
    Creates a new bridge in openvswitch
    :param bridge_name: name of the bridge to create
    :return: boolean
    """
    if not ovs_bridge_exists(bridge_name):
        rv = os.system("ovs-vsctl add-br %s" % bridge_name)
        if rv == 0:
            # let's configure this bridge as well
            allow_bpdu(bridge_name)
            return True
        else:
            return False

    else:
        return True


def allow_bpdu(bridge_name):
    """
    Configures an ovs bridge to forward things like LLDP
    :param bridge_name: name of the bridge to configure
    :return: boolean
    """
    rv = os.system("ovs-vsctl set bridge %s other-config:forward-bpdu=true" % bridge_name)
    if rv == 0:
        return True
    else:
        return False


def delete_bridge(bridge_name):
    """
     Deletes a new bridge in openvswitch
     :param bridge_name: name of the bridge to create
     :return: boolean
     """
    rv = os.system("ovs-vsctl del-br %s" % bridge_name)
    if rv == 0:
        return True
    else:
        return False
