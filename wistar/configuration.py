# some basic configuration parameters for wistar

# images director
user_images_dir = "/opt/wistar/user_images"


# shortcut to fill in default instance password in 'New VM' screen
# Make sure this meets the complexity requirements for your VMs!
# i.e. for junos you need 3 of these 4: upper / lower / special / number
default_instance_password = 'Clouds123'

# deployment backend to use!
# defaults to kvm
# options are 'openstack', 'vagrant', 'virtualbox'
deployment_backend = 'kvm'
# deployment_backend = 'openstack'

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

# user that will be configured via cloud-init - override this to your username if desired!
ssh_user = "wistar"
# this key will be added to cloud-init enabled hosts in the user-data file
# by default this is a dummy key! Replace this with your own key generated from 'ssh-keygen'
ssh_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCo33zCWVdSnQm2fDAZm9WsKH5W4ejMx8eaM7LssGjqefUlIu5LsNzbMUIxMT6eaXdlAwzw0jZfrI4fDj5nmBP2p2BCGYAFODpAKLJGr/cJZj4J+jbx3zxnW/eQ3PUkpu3ncWZj58hynOWDFWChMUV5nimbr5kVlFS5vhuvpZQUT9NMKo3NXuH8a3bkqh32hWS2eXE+FPy9vvcE3CoydgdPR+Z6T5Qqf0xCZ5Fzu7mMvB7BiVaj//KHI4xo/EE6vxKAMXwZ0YeaB1LyheEV66+DCcd5a/744LXxqfdA0yp38g68DBE6LK2jRWIPyTDSxWfW2lFe2M2XsUx0TDSKSLLb dummykey@REPLACEME"

# Registered VM Image types
# this list will register the javascript VM configuration settings in
# common/static/js/vm_types
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
        "name": "junos_vqfx_cosim",
        "description": "Junos vQFX Cosim",
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
