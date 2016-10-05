from common.lib import libvirtUtils


def get_domain_status_for_topology(topology_id):
    domain_status = libvirtUtils.get_domains_for_topology("t" + str(topology_id) + "_")

    status = "running"
    for d in domain_status:
        if d["state"] == "shut off":
            status = "powered off"
            break

    return status
