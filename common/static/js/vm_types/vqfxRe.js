draw2d.shape.node.vqfxRe = draw2d.shape.node.wistarSetParent.extend({
    NAME: "draw2d.shape.node.vqfxRe",
    INTERFACE_PREFIX: "xe-0/0/",
    MANAGEMENT_INTERFACE_PREFIX: "em",
    MANAGEMENT_INTERFACE_INDEX: 0,
    MANAGEMENT_INTERFACE_TYPE: "e1000",
    INTERFACE_TYPE: "e1000",
    DOMAIN_CONFIGURATION_FILE: "junos_vqfx.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 10,
    ICON_FILE: "/static/images/vqfx.png",
    DUMMY_INTERFACE_LIST: ["2"],
    COMPANION_TYPE: "draw2d.shape.node.vqfxCosim",
    COMPANION_INTERFACE_LIST: ["1"],
    COMPANION_NAME_FILTER: "Cosim|COSIM|qfx.*pfe|QFX.*PFE|qfx.*PFE",
    VCPU: 2,
    VRAM: 2048,
    TERTIARY_DISK_PARAMS: {
        "type": "config_drive",
        "qemu_type": "raw",
        "bus_type": "usb"
    },
    CONFIG_DRIVE_SUPPORT: true,
    CONFIG_DRIVE_PARAMS: [
        {
            "template": "junos_vqfx_config.j2",
            "destination": "/juniper.conf"
        }
    ]
});
