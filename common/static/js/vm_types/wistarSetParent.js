wistarSetParentIPLocator = draw2d.layout.locator.Locator.extend({
    NAME: "wistarSetParentIPLocator",
    init: function(parent)
    {
        this._super(parent);
    },
    relocate: function(index, target)
    {
        var parent = target.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, parent.getHeight() + 60);
    }
});

draw2d.shape.node.wistarSetParent = draw2d.shape.node.wistarVm.extend({
    NAME: "draw2d.shape.node.wistarSetParent",
    INTERFACE_PREFIX: "eth",
    MANAGEMENT_INTERFACE_PREFIX: "eth",
    MANAGEMENT_INTERFACE_INDEX: 0,
    DOMAIN_CONFIGURATION_FILE: "domain.xml",
    ICON_WIDTH: 50,
    ICON_HEIGHT: 10,
    ICON_FILE: "/static/images/vre.png",
    DUMMY_INTERFACE_LIST: [],
    COMPANION_TYPE: "draw2d.shape.node.wistarSetChild",
    COMPANION_INTERFACE_LIST: ["1"],
    COMPANION_NAME_FILTER: ".*",

    getChildId: function() {
        // if this is a vre, then there should be a child
        if (this.getUserData()["child"] != undefined) {
            return this.getUserData()["child"];
        } else {
            return "0";
        }
    },
    setChildId: function(child_id) {
        // track it here so we can link them during deployment
        var ud = this.getUserData();
        ud["child"] = child_id;
    },
    setBootState: function(state) {
        this.bootState = state;
        if (this.bootStateIcon == undefined) {
            this.bootStateIcon = new draw2d.shape.basic.Circle();
            this.bootStateIcon.setBackgroundColor("#FF0000");
            this.bootStateIcon.setDimension(8, 8);
            this.add(this.bootStateIcon, new BootStateLocator(this));
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
    setLabel: function(label) {
        var ud = this.getUserData();
    	ud["label"] = label;
        this.setName(label);
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setChildId(memento.userData.child);
    },
    setIp: function(ip) {
	    var ud = this.getUserData();
	    ud["ip"] = ip;
	    if (this.ipLabel == undefined) {
		    this.ipLabel = new wistarLabel({text: ip });
	        this.ipLabel.setColor("#000");
        	this.ipLabel.setFontColor("#000");
        	this.ipLabel.setStroke(0);
        	this.add(this.ipLabel, new wistarSetParentIPLocator(this));
	    } else {
            this.ipLabel.text =  ip;
        }
    }
});
