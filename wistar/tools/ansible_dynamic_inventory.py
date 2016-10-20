#!/usr/bin/env python
# simple script to find parse an exported wistar topology
# for all the configured virtual machines and generate an ansible inventory
#
# in order to use static groups, this script should be placed in a directory
# called something like 'inventory' and called with
# > ansible -m debug -a "var=hostvars" -i inventory *
# the wistar topology file should NOT be in this same directory!
#
# this script expects to find that json file located in it's PARENT
# directory - this is to avoid ansible parsing the exported topology as an inventory file!
#
# best practice is to place the exported topology in the 'root' directory of you playbook structure
# and create an 'inventory' directory to contain this script and any other static configurations you
# need. Ansible will parse ALL the files in this inventory directory to produce the hostvars

# 10192016 - nembery

import json
import os

topology_json = []
inventory = {}

# what is the path to this script?
path = os.path.abspath(os.path.dirname(__file__))

# now, let's get the PARENT of this script
parent_path = os.path.join(path, '..')

# First, let's find the wistar topology file in the PARENT directory
files_in_dir = os.listdir(parent_path)
for fname in files_in_dir:
    if ".wistar.json" in fname:
        fpath = os.path.join(parent_path, fname)
        with open(fpath, 'r') as f:
            topology_json = f.read()
            break

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

