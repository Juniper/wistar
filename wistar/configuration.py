# some basic configuration parameters for wistar

# images director
user_images_dir = "/opt/images/user_images"


# deployment backend to use!
# defaults to kvm
# options are 'openstack', 'vagrant', 'virtualbox'
#deployment_backend = 'kvm'
deployment_backend = 'openstack'

# Openstack configuration
use_openstack = True
openstack_host = '10.0.1.144'
openstack_user = 'admin'
openstack_password = 'secret'

# project under which to place all topologies/stacks
openstack_project = 'admin'

openstack_mgmt_network = 'wistar_mgmt'
openstack_external_network = 'public-br-eth0'

# VM management network prefix
# this should match your Openstack mgmt_network subnet or the config of virbr0 when using KVM
management_subnet = '192.168.122.0/24'
management_prefix = '192.168.122.'
management_gateway = '192.168.122.1'

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
        "description": "Junos vMX vPFE",
        "js": "draw2d.shape.node.vpfe",
    },
    {
        "name": "junos_vpfe_haswell",
        "description": "Junos vMX vPFE (Haswell)",
        "js": "draw2d.shape.node.vpfe_haswell",
    },
    {
        "name": "junos_vqfx_re",
        "description": "Junos vQFX RE",
        "js": "draw2d.shape.node.vqfxRe",
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
        "name": "junos_firefly",
        "description": "Junos vSRX 1.0",
        "js": "draw2d.shape.node.vsrx",
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
