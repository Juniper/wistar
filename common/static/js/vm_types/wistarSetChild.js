draw2d.shape.node.wistarSetChild = draw2d.shape.node.wistarStandalone.extend({
    NAME: "draw2d.shape.node.wistarSetChild",
    VCPU: 3,
    VRAM: 6144,
    INTERFACE_PREFIX: "eth",
    MANAGEMENT_INTERFACE_PREFIX: "eth",
    MANAGEMENT_INTERFACE_INDEX: 0,
    DOMAIN_CONFIGURATION_FILE: "domain.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 40,
    ICON_FILE: "/static/images/vmx.png",
    DUMMY_INTERFACE_LIST: [],
    COMPANION_TYPE: "draw2d.shape.node.wistarSetParent",
    COMPANION_INTERFACE_LIST: ["1"],

    getParentId: function() {
        // if this is a parent, then there should be a parent
        if (this.getUserData()["parent"] != undefined) {
            return this.getUserData()["parent"];
        } else {
            return "0";
        }
    },
    setParentId: function(parent_id) {
        // track it here so we can link them during deployment
        var ud = this.getUserData();
        ud["parent"] = parent_id;
    },
    getParentName: function() {
        // if this is a parent, then there should be a parent
        if (this.getUserData()["parentName"] != undefined) {
            return this.getUserData()["parentName"];
        } else {
            return "";
        }
    },
    setParentName: function(parent_name) {
        // track it here so we can link them during deployment
        var ud = this.getUserData();
        ud["parentName"] = parent_name;
    },
    getLabel: function() {
    	return this.getParentName();
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
            this.setName(label + "_child");
            this.setParentName(label);
        } else {
            label = this.getParentName();
        }
        if (this.label == undefined) {
    	    this.label = new wistarLabel({text: label });
            this.label.setColor("#0d0d0d");
            this.label.setFontColor("#0d0d0d");
            this.label.setStroke(0);
            this.add(this.label, new BottomCenterLocator(this));
        } else {
            this.label.text = label;
        }
    },
    setIp: function(ip) {
		var ud = this.getUserData();
		ud["ip"] = ip;
	},
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setParentId(memento.userData.parent);
        this.setParentName(memento.userData.parentName);

    },
    // override default dc handler
	onDoubleClick: function() {
	   loadInstanceDetails();
	}
});
