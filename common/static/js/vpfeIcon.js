draw2d.shape.node.vpfeIcon = draw2d.shape.node.standaloneIcon.extend({
    NAME: "draw2d.shape.node.vpfeIcon",
    EDIT_POLICY: false,
    VCPU: 4,
    VRAM: 8192,
    CONFIG_FILE: "vmx_vpfe_config.xml",

    init: function() {
        var width = 50;
        var height = 50;
        var icon = "/static/images/vmx.png";
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
        return "fxp0";
    },
    getVRE: function() {
        // if this is a vre, then there should be a vre
        if (this.getUserData()["vre"] != undefined) {
            return this.getUserData()["vre"];
        } else {
            return "0";
        }
    },
    setVRE: function(vre_id) {
        // track it here so we can link them during deployment
        var ud = this.getUserData();
        ud["vre"] = vre_id;
    },
    getParentName: function() {
        // if this is a vre, then there should be a vre
        if (this.getUserData()["parentName"] != undefined) {
            return this.getUserData()["parentName"];
        } else {
            return "";
        }
    },
    setParentName: function(parent_name) {
        var ud = this.getUserData();
        ud["parentName"] = parent_name;
    },
    setBootState: function(state) {
        this.bootState = state;
    },
    getBootState: function() {
        return this.bootState;
    },
    setLabel: function(label) {
        if (this.getParentName() == "") {
            // do not overwrite name on unserialize from json
            this.setName(label + "_vpfe");
            this.setParentName(label);
        };
        if (this.label == undefined) {
    	    this.label = new draw2d.shape.basic.Label(label);
            this.label.setColor("#0d0d0d");
            this.label.setFontColor("#0d0d0d");
            this.label.setStroke(0);
            this.addFigure(this.label, new BottomCenterLocator(this));
        } else {
            this.label.text = label;
        }
    },
    getPersistentAttributes: function() {
        // force grabbing the mgnt interface
        var ud = this.getUserData();
        ud["mgmtInterface"] = this.getMgmtInterface();
        ud["wistarVm"] = true;
        ud["configurationFile"] = this.CONFIG_FILE;
        return this._super();
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setImage(memento.userData.image);
        this.setType(memento.userData.type);
        this.setPassword(memento.userData.password);
        this.setCpu(memento.userData.cpu);
        this.setRam(memento.userData.ram);
        this.setIp(memento.userData.ip);
        this.setLabel(memento.userData.parentName);
        this.setVRE(memento.userData.vre);
    }
});
