
from topologies.models import Topology
from common.lib import libvirtUtils

import json


def get_used_ips():
    """
    get a list of all IPs that have been configured on topologyIcon objects
    :return: list of used ips
    """

    all_ips = []

    topologies = Topology.objects.all()

    for topology in topologies:
        json_data = json.loads(topology.json)
        for jsonObject in json_data:
            if jsonObject["type"] == "draw2d.shape.node.topologyIcon":
                ud = jsonObject["userData"]
                ip = ud["ip"]
                last_octet = ip.split('.')[-1]
                all_ips.append(int(last_octet))

    all_ips.sort()
    return all_ips


def get_next_ip(all_ips, floor):
    # get the first available int value from the list
    # that is greater than the floor value
    # [ 2, 4, 7 ] with floor of 2 will return 3
    # [] with floor of 2 will return 2
    all_ips.sort()

    if len(all_ips) > 0:

        minimum = all_ips[0]
        maximum = all_ips[-1]
        last = all_ips[0]

        if minimum > floor:
            return int(floor)

        for ip in all_ips:
            if (ip - last) > 1:
                return last + 1
            else:
                last = ip

        return maximum + 1

    else:
        return floor


def get_domain_status_for_topology(topology_id):

    domain_status = libvirtUtils.get_domains_for_topology("t" + str(topology_id) + "_")

    status = "running"
    for d in domain_status:
        if d["state"] == "shut off":
            status = "powered off"
            break

    return status