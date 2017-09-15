draw2d.shape.node.vrr = draw2d.shape.node.wistarStandalone.extend({
    NAME: "draw2d.shape.node.vrr",
    VCPU: 1,
	VRAM: 512,
    INTERFACE_PREFIX: "em",
    INTERFACE_TYPE: "virtio",
    MANAGEMENT_INTERFACE_PREFIX: "em",
    MANAGEMENT_INTERFACE_INDEX: 0,
    MANAGEMENT_INTERFACE_TYPE: "virtio",
    DOMAIN_CONFIGURATION_FILE: "junos_vcp.xml",
    INTERFACE_OFFSET: 1,
    DUMMY_INTERFACE_LIST: [],
    ICON_WIDTH: 50,
    ICON_HEIGHT: 15,
    ICON_FILE: "/static/images/vre.png",

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
    CONFIG_DRIVE_PARAMS: [
    /*
        {
            "template":  "vrr_boot_loader.j2",
            "destination": "/boot/loader.conf"
        },
    */
        {
            "template": "junos_config.j2",
            "destination": "/juniper.conf"
        }
    ]
});
