draw2d.shape.node.vriot_virtio = draw2d.shape.node.wistarSetChild.extend({
    NAME: "draw2d.shape.node.vriot_virtio",
    VCPU: 3,
    VRAM: 4096,
    INTERFACE_PREFIX: "ge-0/0/",
    INTERFACE_TYPE: "virtio",
    MANAGEMENT_INTERFACE_PREFIX: "fxp",
    MANAGEMENT_INTERFACE_TYPE: "virtio",
    MANAGEMENT_INTERFACE_INDEX: 0,
    DOMAIN_CONFIGURATION_FILE: "junos_riot_virtio.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 40,
    ICON_FILE: "/static/images/vmx.png",
    COMPANION_TYPE: "draw2d.shape.node.vmx_virtio",
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
    CONFIG_DRIVE_PARAMS: [
        {
            "template":  "vriot_boot_loader.j2",
            "destination": "/boot/loader.conf"
        }
    ]
});
