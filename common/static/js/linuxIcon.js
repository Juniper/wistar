draw2d.shape.node.linuxIcon = draw2d.shape.node.standaloneIcon.extend({
    NAME: "draw2d.shape.node.linuxIcon",
    EDIT_POLICY: false,

    init: function() {
        var width = 30;
        var height = 50;
        var icon = "/static/images/server.png";
        this._super(icon, width, height);
    },
    setup: function(type, label, ip, pw, image, cpu, ram) {
        this.setImage(image);
        this.setLabel(label);
        this.setType(type);
        this.setPassword(pw);
        this.setCpu(cpu);
        this.setRam(ram);
        this.setIp(ip);
    },
    getMgmtInterface: function() {
        // for linux the mgmt interface will always be the 
        // last interface - get all connections then add 1 
        // for the mgmt interface
        // i.e. if 2 connections - eth0 and eth1 will be the user
        // defined connections, then make eth2 the mgmt interface
        var port = this.getPorts().get(0);
        var connections = port.getConnections();
        mgmtInterfaceIndex = connections.size;
        return "eth" + mgmtInterfaceIndex;
    },
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
        this.setImage(memento.userData.image);
        this.setType(memento.userData.type);
        this.setPassword(memento.userData.password);
        this.setCpu(memento.userData.cpu);
        this.setRam(memento.userData.ram);
        this.setIp(memento.userData.ip);
        this.setConfigScriptId(memento.userData.configScriptId);
        this.setConfigScriptParam(memento.userData.configScriptParam);
        this.setLabel(memento.userData.name);
    }
});
