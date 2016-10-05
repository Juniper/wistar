draw2d.shape.node.vriot = draw2d.shape.node.wistarSetChild.extend({
    NAME: "draw2d.shape.node.vriot",
    VCPU: 1,
    VRAM: 1024,
    INTERFACE_PREFIX: "ge-0/0/",
    MANAGEMENT_INTERFACE_PREFIX: "fxp",
    MANAGEMENT_INTERFACE_TYPE: "e1000",
    MANAGEMENT_INTERFACE_INDEX: 0,
    DOMAIN_CONFIGURATION_FILE: "junos_riot.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 40,
    ICON_FILE: "/static/images/vmx.png",
    COMPANION_TYPE: "draw2d.shape.node.vre",
    DUMMY_INTERFACE_LIST: ["2"],
    COMPANION_INTERFACE_LIST: ["1"],
    SECONDARY_DISK_PARAMS: {
        "type": "blank",
        "qemu_type": "qcow2",
        "size": "16G",
        "partition": true,
        "bus_type": "ide"
    },
    TERTIARY_DISK_PARAMS: {
        "type": "config_drive",
        "qemu_type": "raw",
        "bus_type": "ide"
    },

    CONFIG_DRIVE_SUPPORT: true,
    CONFIG_DRIVE_PARAMS_FILE: "/boot/loader.conf",
    CONFIG_DRIVE_PARAMS: {
        "hw.pci.link.0x60.irq": 10,
        "vm_chassis_i2cid": "21",
        "vm_i2cid": "0xBAA",
        "vm_instance": 0,
        "vm_is_virtual": 1,
        "vm_ore_present": 0,
        "vm_retype": "RE-VMX",
        "vmtype": 1,
        "vm_chassisname": "vMX",
        "vm_chassname": "vMX",
        "console": "vidconsole,comconsole"
    }

});
