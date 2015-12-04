draw2d.shape.node.vreIcon = draw2d.shape.node.vmIcon.extend({
    NAME: "draw2d.shape.node.vreIcon",
    EDIT_POLICY: false,

    init: function() {
        var width = 50;
        var height = 10;
        var icon = "/static/images/vmx.png";
        this._super(icon, width, height);
    },
    setup: function(type, name, ip, pw, image, cpu, ram) {
        this.setImage(image);
        this.setName(name);
        this.setType(type);
        this.setPassword(pw);
        this.setCpu(cpu);
        this.setRam(ram);
        this.setIp(ip);
    },
    getMgmtInterface: function() {
        return "fxp0";
    },
    getVPFE: function() {
        // if this is a vre, then there should be a vpfe
        if (this.getUserData()["vpfe"] != undefined) {
            return this.getUserData()["vpfe"];
        } else {
            return "0";
        }
    },
    setVPFE: function(vpfe_id) {
        // track it here so we can link them during deployment
        var ud = this.getUserData();
        ud["vpfe"] = vpfe_id;
    },
    setBootState: function(state) {
        this.bootState = state;
        if (this.bootStateIcon == undefined) {
            this.bootStateIcon = new draw2d.shape.basic.Circle();
            this.bootStateIcon.setBackgroundColor("#FF0000");
            this.bootStateIcon.setDimension(8, 8);
            this.addFigure(this.bootStateIcon, new BootStateLocator(this));
        }
        if (state == "up") {
            this.bootStateIcon.setBackgroundColor("#00FF00");
        } else {
            this.bootStateIcon.setBackgroundColor("#FF0000");
        }
    },
    getBootState: function() {
        return this.bootState;
    },
    getPersistentAttributes: function() {
        // force grabbing the mgnt interface
        var ud = this.getUserData();
        ud["mgmtInterface"] = this.getMgmtInterface();
        ud["wistarVm"] = true;
        ud["configurationFile"] = "domain_phase_2.xml";
        return this._super();
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setImage(memento.userData.image);
        this.setName(memento.userData.name);
        this.setType(memento.userData.type);
        this.setPassword(memento.userData.password);
        this.setCpu(memento.userData.cpu);
        this.setRam(memento.userData.ram);
        this.setIp(memento.userData.ip);
        this.setVPFE(memento.userData.vpfe);
    }
});
