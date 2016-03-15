from base_vm import BaseVM


class JunosVCP(BaseVM):

    type_name = "Junos VMX VCP"
    type_description = "Junos VMX Virtual Control Plane"

    icon_image = "/static/images/vre.png"
    icon_object = "draw2d.shape.node.wistarSetParent"

    management_interface_index = "fxp"
    management_interface_index = 0
    management_interface_type = "e1000"

    interface_prefix = "ge-0/0/"

    companion_interface_list = ["1"]
    companion_type = "JunosVFP"

    secondary_disk_type = "ide"
    tertiary_disk_type = "usb"

    smbios_manufacturer = "Juniper"
    smbios_product_string = "VM-vcp_vmx1-161-re-0"
    smbios_version = "0.1.0"



