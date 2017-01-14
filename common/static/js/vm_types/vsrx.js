draw2d.shape.node.vsrx = draw2d.shape.node.wistarStandalone.extend({
    NAME: "draw2d.shape.node.vsrx",
    MANAGEMENT_INTERFACE_PREFIX: "fxp",
    MANAGEMENT_INTERFACE_INDEX: 0,
    MANAGEMENT_INTERFACE_TYPE: "virtio",
    INTERFACE_PREFIX: "ge-0/0/",
    INTERFACE_TYPE: "virtio",
    DOMAIN_CONFIGURATION_FILE: "domain_firefly.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 50,
    ICON_FILE: "/static/images/virtual_firewall.png",
    VCPU: 2,
    VRAM: 4096,
    TERTIARY_DISK_PARAMS: {
        "type": "config_drive",
        "qemu_type": "raw",
        "bus_type": "usb"
    },
    CONFIG_DRIVE_SUPPORT: true,
    CONFIG_DRIVE_PARAMS: [
        {
            "template": "junos_config.j2",
            "destination": "/juniper.conf"
        }
    ]
});
