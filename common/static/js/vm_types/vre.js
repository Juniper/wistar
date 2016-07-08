draw2d.shape.node.vre = draw2d.shape.node.wistarSetParent.extend({
    NAME: "draw2d.shape.node.vre",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 10,
    ICON_FILE: "/static/images/vre.png",

    INTERFACE_PREFIX: "ge-0/0/",
    MANAGEMENT_INTERFACE_PREFIX: "fxp",
    MANAGEMENT_INTERFACE_INDEX: 0,
    MANAGEMENT_INTERFACE_TYPE: "e1000",
    DOMAIN_CONFIGURATION_FILE: "junos_vcp.xml",

    COMPANION_TYPE: "draw2d.shape.node.vpfe",
    COMPANION_INTERFACE_LIST: ["1"],
    COMPANION_NAME_FILTER: "vFPC",

    SECONDARY_DISK_TYPE: "ide",
    SECONDARY_DISK_NAME_FILTER: "HDD",
    TERTIARY_DISK_TYPE: "usb",
    TERTIARY_DISK_NAME_FILTER: "USB",

    SMBIOS_PRODUCT_STRING_PREFIX: "VM-",
    SMBIOS_PRODUCT_STRING_SUFFIX: "-161-re-0",
    SMBIOS_MANUFACTURER: "Juniper",
    SMBIOS_VERSION: "0.1.0",

});
