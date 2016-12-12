#!/usr/bin/env python
# simple script to find an exported wistar topology in the current directory
# and parse it for all the configured virtual machines
# in order to use static groups, this script should be placed in a directory
# called something like 'inventory' or 'hosts' etc.
# call with ansible -m debug -a "var=hostvars" -i inventory *
# the wistar topology file should NOT be in this same directory
# this script expects to find that json file located in it's parent
# directory - this is to avoid ansible parsing this file as an inventory file
# 10192016 - nembery

import argparse
import json
import os
import sys

parser = argparse.ArgumentParser()
parser.add_argument("--host")
parser.add_argument("--list", action="store_true")
args = parser.parse_args()

if args.host is not None:
    print "{}"
    sys.exit(0)

topology_json = []
inventory = {}


def get_topology_from_path(path):
    # search the given directory for a file with a .wistar.json extension
    files_in_dir = os.listdir(path)
    for fname in files_in_dir:
        if ".wistar.json" in fname:
            fpath = os.path.join(path, fname)
            with open(fpath, 'r') as f:
                return f.read()

    # not found in this directory
    return None


# what is the path to this script?
current_path = os.path.abspath(os.path.dirname(__file__))
# let's search here first for the wistar json file
topology_json = get_topology_from_path(current_path)

if topology_json is None:
    # if wasn't found here, what about in our parent directory?
    # now, let's get the PARENT of this script
    parent_path = os.path.join(current_path, '..')
    topology_json = get_topology_from_path(parent_path)

raw_json = json.loads(topology_json)
for json_object in raw_json:
    if "userData" in json_object and "wistarVm" in json_object["userData"]:
        ud = json_object["userData"]

        if "parentName" not in ud:
            # child VMs will have a parentName attribute
            # let's skip them for ansible purposes
            name = ud.get('name', 'no name')
            ip = ud.get('ip', '0.0.0.0')
            username = ud.get('username', 'root')
            inventory[str(name)] = {"ansible_host": str(ip), "ansible_user": str(username)}

print inventory
