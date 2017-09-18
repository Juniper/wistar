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

# some basic configuration parameters for wistar

# shortcut to fill in default instance password in 'New VM' screen
# Make sure this meets the complexity requirements for your VMs!
# i.e. for junos you need 3 of these 4: upper / lower / special / number
default_instance_password = 'Clouds123'

# user that will be configured via cloud-init - override this to your username if desired!
# Note this cannot be 'root'
ssh_user = "wistar"
# this key will be added to cloud-init enabled hosts in the user-data file
# by default this is a dummy key! Replace this with your own key generated from 'ssh-keygen'
ssh_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDgjgNd0Lej/1Rpcc9GEEoVV0RVbNW8TPvUzJzOTNZ76aoe83QZnUI5jXJLLg44j/J/vlUyFKEoPQokpezAUBtIyiglhPC0XN3Yxox82vtQxHItQenc8GAYvo6s8kvbDW0FX4xSfo9p3/nUlGrrCPYGrRCUaji76Xk4TQNW6aUVJYp3ReboZhy+3HO/BoljopMoKZF5OxAWhgJZ/+h+ADeoMw68V+sW/t/10yt84GEQ3TBNtSM5wSUh8u+YoPG13Kz36HsMa7gZbp8AABMSrvUys494IOyeQEJUV96bn1V1vyaVMxv/hI0/ektz56R4rwcIVw3V0NXholEPmBXDhWW3 wistar@dummykey"
# Registered VM Image types
# this list will register the javascript VM configuration settings in
# common/static/js/vm_types

# images director
user_images_dir = "/opt/wistar/user_images"

# deployment backend to use!
# defaults to kvm
# options are 'openstack', 'vagrant', 'virtualbox'
deployment_backend = 'kvm'
# deployment_backend = 'openstack'

# KVM configuration
# cache mode, controls the cache mode:
# https://www.suse.com/documentation/sles11/book_kvm/data/sect1_1_chapter_book_kvm.html
# some filesystems do not support cache='none'
# valid options are 'none', 'writeback', 'writethrough', 'unsafe', 'directsync'
# it's possible there is some performance gain with 'none' and 'native' but this is not supported on all platforms!
filesystem_cache_mode = 'writethrough'
# io mode can be 'native' or 'threads'
filesystem_io_mode = 'threads'

# Openstack configuration
# show openstack options even if not the primary deployment option
# i.e. upload to glance is available but still deploy locally to kvm
use_openstack = False
# authentication parameters
openstack_host = '10.10.10.10'
openstack_user = 'admin'
openstack_password = 'SECRET'

# project under which to place all topologies/stacks
openstack_project = 'admin'

openstack_mgmt_network = 'wistar_mgmt'
openstack_external_network = 'public-br-eth0'

# Parameters for use with the VirtualBox deployment backend
# Host only network name in VirtualBox
virtual_box_host_only_net_name = 'vboxnet0'

# default external bridge name
kvm_external_bridge = "br0"

# Define the starting port number for VM's VNC
# This is needed if the system is using port 5900 or subsequent ports
# that may conflict qemu's assignemnt
vnc_start_port = 6000

# VM management network prefix
# this should match your Openstack mgmt_network subnet or the config of virbr0 when using KVM
management_subnet = '192.168.122.0/24'
management_prefix = '192.168.122.'
management_gateway = '192.168.122.1'

# wistar cloud init seeds director / temp directory
seeds_dir = "/opt/wistar/seeds/"


vm_image_types = [
    {
        "name": "blank",
        "description": "Blank",
        "js": "draw2d.shape.node.generic",
    },
    {
        "name": "linux",
        "description": "Linux",
        "js": "draw2d.shape.node.linux",
    },
    {
        "name": "ubuntu16",
        "description": "Ubuntu 16",
        "js": "draw2d.shape.node.ubuntu16",
    },
    {
        "name": "junos_vmx",
        "description": "Junos vMX Phase 1",
        "js": "draw2d.shape.node.vmx",
    },
    {
        "name": "junos_vre",
        "description": "Junos vMX RE",
        "js": "draw2d.shape.node.vre",
    },
    {
        "name": "junos_vpfe",
        "description": "Junos vMX vFPC",
        "js": "draw2d.shape.node.vpfe",
    },
    {
        "name": "junos_vpfe_haswell",
        "description": "Junos vMX vFPC (Haswell)",
        "js": "draw2d.shape.node.vpfe_haswell",
    },
    {
        "name": "junos_vqfx_re",
        "description": "Junos vQFX RE",
        "js": "draw2d.shape.node.vqfxRe",
    },
    {
        "name": "junos_riot",
        "description": "Junos vMX RIOT",
        "js": "draw2d.shape.node.vriot",
    },
    {
        "name": "junos_vrr",
        "description": "Junos Virtual Route Reflector",
        "js": "draw2d.shape.node.vrr",
    },
    {
        "name": "junos_vqfx_cosim",
        "description": "Junos vQFX PFE",
        "js": "draw2d.shape.node.vqfxCosim",
    },
    {
        "name": "generic",
        "description": "Other",
        "js": "draw2d.shape.node.generic",
    },
    {
        "name": "junos_vsrx",
        "description": "Junos vSRX",
        "js": "draw2d.shape.node.vsrx",
    },
    {
        "name": "junos_vmx_hdd",
        "description": "Junos vMX HDD",
        "js": "draw2d.shape.node.generic",
    },
        {
        "name": "space",
        "description": "Junos Space",
        "js": "draw2d.shape.node.space",
    }
]
