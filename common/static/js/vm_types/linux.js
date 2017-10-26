draw2d.shape.node.linux = draw2d.shape.node.wistarStandalone.extend({
    NAME: "draw2d.shape.node.linux",
    INTERFACE_PREFIX: "eth",
    // useful for interface naming in the GUI and via automation actions
    // i.e. if management interface is eth0, then first usable interface for connections is 0 + 1 == eth1
    INTERFACE_OFFSET: 1,
    MANAGEMENT_INTERFACE_PREFIX: "eth",
    // only useful to determine which NIC position
    MANAGEMENT_INTERFACE_INDEX: 0,
    DOMAIN_CONFIGURATION_FILE: "domain.xml",
    ICON_WIDTH: 30,
    ICON_HEIGHT: 50,
    ICON_FILE: "/static/images/server.png",
    CLOUD_INIT_SUPPORT: true,
    RESIZE_SUPPORT: true,

    getConfigScriptId: function() {
        if (this.getUserData()["configScriptId"] != undefined) {
            return this.getUserData()["configScriptId"];
        } else {
            return "0";
        }
    },
    setConfigScriptId: function(id) {
        var ud = this.getUserData();
        ud["configScriptId"] = id;
    },
    getConfigScriptParameter: function() {
        if (this.getUserData()["configScriptParam"] != undefined) {
            return this.getUserData()["configScriptParam"];
        } else {
            return "";
        }
    },
    setConfigScriptParam: function(p) {
        var ud = this.getUserData();
        ud["configScriptParam"] = p;
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setConfigScriptId(memento.userData.configScriptId);
        this.setConfigScriptParam(memento.userData.configScriptParam);
    }
});
