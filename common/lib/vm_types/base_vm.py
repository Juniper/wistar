import json


class BaseVM(object):
    """
    Base Wistar VM configuration class
    """

    type_name = "wistar_base_vm"
    type_description = "Base virtual machine configuration"

    icon_object = "draw2d.shape.node.wistarStandalone"
    icon_image = "/static/images/server.png"
    icon_width = "50"
    icon_height = "50"

    companion_type = ""
    companion_interface_list = []
    dummy_interface_list = []

    virtual_cpu = 1
    virtual_ram = 1024
    interface_pci_slot_offset = 3
    kvm_configuration_file = "domain.xml"

    interface_prefix = "eth"
    interface_type = "virtio"

    management_interface_prefix = "eth"
    management_interface_index = -1
    management_interface_type = "virtio"

    cloud_init = False

    secondary_disk_type = ""
    tertiary_disk_type = ""

    smbios_product_string = "Wistar VM"
    smbios_manufacturer = "Wistar"
    smbios_version = "2.0"

    def get_config(self):
        config = dict()
        config["type_name"] = self.type_name
        config["virtual_cpu"] = self.virtual_cpu
        config["virtual_ram"] = self.virtual_ram

        config["interface_prefix"] = self.interface_prefix
        config["interface_type"] = self.interface_type

        config["icon_image"] = self.icon_image
        config["icon_object"] = self.icon_object

        config["management_interface_index"] = self.management_interface_index
        config["management_interface_prefix"] = self.management_interface_prefix
        config["management_interface_type"] = self.management_interface_type

        config["kvm_configuration_file"] = self.kvm_configuration_file
        config["companion_type"] = self.companion_type
        config["companion_interface_list"] = self.companion_interface_list
        config["interface_pci_slot_offset"] = self.interface_pci_slot_offset
        config["dummy_interface_list"] = self.dummy_interface_list
        config["cloud_init"] = self.cloud_init

        config["secondary_disk_type"] = self.secondary_disk_type
        config["tertiary_disk_type"] = self.tertiary_disk_type

        config["smbios_product_string"] = self.smbios_product_string
        config["smbios_manufacturer"] = self.smbios_manufacturer
        config["smbios_version"] = self.smbios_version

        return config

    def get_config_json(self):
        """
        :return: json config object
        """
        return json.dumps(self.get_config())
