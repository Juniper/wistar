from base_vm import BaseVM


class JunosPhase1VMX(BaseVM):

    type_name = "JunosVMX"
    type_description = "Phase 1 VMX"
    management_interface_index = "em"
    management_interface_index = 0
    interface_prefix = "ge-0/0/"
    dummy_interface_list = ["1"]
    icon_image = "/static/images/vmx.png"


