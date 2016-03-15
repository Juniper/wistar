from base_vm import BaseVM


class JunosVFP(BaseVM):

    type_name = "Junos VMX VFP"
    type_description = "Junos VMX Virtual Forwarding Plane"

    icon_image = "/static/images/vpfe.png"
    icon_object = "draw2d.shape.node.wistarSetChild"

    virtual_cpu = 3
    virtual_ram = 6144

    management_interface_index = "eth"
    management_interface_index = 0

    companion_interface_list = ["1"]
    companion_type = "JunosVCP"




