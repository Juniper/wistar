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

import vm_definitions
import socket

# What should we show as the title across all pages?
# Useful to customize this if you have multiple wistar instances on different servers / clusters
wistar_hostname = socket.gethostname()
wistar_title = 'Wistar - Virtual Lab Environment - Host: ' + wistar_hostname

# shortcut to fill in default instance password in 'New VM' screen
# Make sure this meets the complexity requirements for your VMs!
# i.e. for junos you need 3 of these 4: upper / lower / special / number
default_instance_password = 'Clouds123'

# user that will be configured via cloud-init - override this to your username if desired!
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

# openstack horizon url is used to create Horizon URLs
# some version of openstack use '/dashboard', '/horizon', or '/'
openstack_horizon_url = "http://10.10.10.10"

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

# Use OVS bridges - THIS IS EXPERIMENTAL AND WILL ALMOST CERTAINLY NOT WORK IN MOST CASES
# Best to keep this as false for now until ovs libvirt support has matured a bit
use_openvswitch = False

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

# keep vm_image_types in a separate file and just include them here
vm_image_types = vm_definitions.vm_image_types
