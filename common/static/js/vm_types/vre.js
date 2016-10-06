draw2d.shape.node.vre = draw2d.shape.node.wistarSetParent.extend({
    NAME: "draw2d.shape.node.vre",
    VCPU: 1,
    VRAM: 512,
    ICON_WIDTH: 50,
    ICON_HEIGHT: 10,
    ICON_FILE: "/static/images/vre.png",

    INTERFACE_PREFIX: "ge-0/0/",
    MANAGEMENT_INTERFACE_PREFIX: "fxp",
    MANAGEMENT_INTERFACE_INDEX: 0,
    MANAGEMENT_INTERFACE_TYPE: "e1000",
    DOMAIN_CONFIGURATION_FILE: "junos_vcp.xml",
    DUMMY_INTERFACE_LIST: ["2"],
    COMPANION_TYPE: "draw2d.shape.node.vriot",
    COMPANION_INTERFACE_LIST: ["1"],
    COMPANION_NAME_FILTER: "FPC|PFE|FP|pfe|fpc|fp|riot|RIOT",

    SECONDARY_DISK_PARAMS: {
        "type": "blank",
        "qemu_type": "qcow2",
        "size": "16G",
        "partition": true,
        "bus_type": "ide"
    },
    // SECONDARY_DISK_NAME_FILTER: "HDD|hdd|hard|disk|scratch|config",
    TERTIARY_DISK_PARAMS: {
        "type": "config_drive",
        "qemu_type": "raw",
        "bus_type": "ide"
    },
    // TERTIARY_DISK_NAME_FILTER: "USB|usb|ide",

    //SMBIOS_PRODUCT_STRING_PREFIX: "VM-",
    //SMBIOS_PRODUCT_STRING_SUFFIX: "-21-re-0",
    //SMBIOS_MANUFACTURER: "Juniper",
    //SMBIOS_VERSION: "0.1.0",

    CONFIG_DRIVE_SUPPORT: true,
    CONFIG_DRIVE_PARAMS_FILE: "/boot/loader.conf",
    CONFIG_DRIVE_PARAMS: {
        "hw.pci.link.0x60.irq": 10,
        "hw.ata.ata_dma": 1,
        "hw.ata.atapi_dma": 1,
        "vm_chassis_i2cid": "161",
        "vm_i2cid": "0xBAB",
        "vm_instance": 0,
        "vm_is_virtual": 1,
        "vm_ore_present": 0,
        "vm_retype": "RE-VMX",
        "vmtype": 0,
        "vm_chassisname": "vMX",
        "vm_chassname": "vMX",
        "console": "vidconsole,comconsole"
    }

});
