from common.lib import libvirtUtils
from django.http import HttpResponse
import json


def get_domain_status_for_topology(topology_id):
    domain_status = libvirtUtils.get_domains_for_topology("t" + str(topology_id) + "_")

    status = "running"
    for d in domain_status:
        if d["state"] == "shut off":
            status = "powered off"
            break

    return status


def return_json(status, message, **kwargs):
    return_val = dict()
    return_val["status"] = status
    return_val["message"] = message

    for k, v in kwargs.iteritems():
        return_val[k] = v

    return HttpResponse(json.dumps(return_val), content_type="application/json")