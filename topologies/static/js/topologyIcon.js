topologyIconPortLocator = draw2d.layout.locator.PortLocator.extend({
    init: function() {
        this._super();
    },
    relocate: function(index, figure) {
        var node = figure.getParent();
        var x = node.getWidth() / 2;
        var y = node.getHeight() / 2;
        this.applyConsiderRotation(figure, x, y);
    }
});
BottomCenterLocator = draw2d.layout.locator.Locator.extend({
    init: function(parent)
    {
        this._super(parent);
    },
    relocate: function(index, target)
    {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, parent.getHeight() + 5);
    }
});
draw2d.shape.node.topologyIcon = draw2d.shape.basic.Image.extend({
    NAME: "draw2d.shape.node.topologyIcon",
    EDIT_POLICY: false,
   
    init: function(icon, width, height) {
	    this._super(icon, width, height);
    	var tpl = new topologyIconPortLocator();
    	this.createPort("hybrid", tpl);
    },
     
    setup: function(type, label, ip, pw, image) {
		this.setUserData({});
		this.setIp(ip);
        this.setImage(image);
		this.setPassword(pw);
		this.setType(type);
		this.setLabel(label);
    },

    initOld: function(type, label, ip, pw, image) {
		var icon;
		var width = 50;
		var height = 50;
		if(type == "mx960" || type == "junos") {
            console.log("setting mx960 icon");
			icon = "/static/images/mx960.png";	
		} else {
			icon = "/static/images/router.png";	
		}
	    this._super(icon, width, height);
		this.setUserData({});
		this.setIp(ip);
        this.setImage(image);
		this.setPassword(pw);
	    this.setupObject(type, label, width, height);
    },
    setType: function(type) {
	    var ud = this.getUserData();
	    ud["type"] = type;
	    //this.setUserData(ud);
    },
    getType: function() {
	    return this.getUserData()["type"];
    },
    setIp: function(ip) {
	    var ud = this.getUserData();
	    ud["ip"] = ip;
	    if (ip != undefined) {
		    this.ipLabel = new draw2d.shape.basic.Label("\n" + ip);
	        this.ipLabel.setColor("#000");
        	this.ipLabel.setFontColor("#000");
        	this.ipLabel.setStroke(0);
        	this.addFigure(this.ipLabel, new BottomCenterLocator(this));
	    }
    },
    getIp: function() {
    	return this.getUserData()["ip"];
    },
    setPassword: function(pw) {
    	var ud = this.getUserData();
    	ud["password"] = pw;
    },
    getPassword: function() {
    	return this.getUserData()["password"];
    },
    setImage: function(im) {
    	var ud = this.getUserData();
    	ud["image"] = im;
    },
    getImage: function() {
    	return this.getUserData()["image"];
    },
    setLabel: function(label) {
    	// console.log("setlabel " + label);
    	var ud = this.getUserData();
    	ud["label"] = label;
    	this.label = new draw2d.shape.basic.Label(label);
        this.label.setColor("#0d0d0d");
        this.label.setFontColor("#0d0d0d");
        this.label.setStroke(0);
        this.addFigure(this.label, new BottomCenterLocator(this));
    },
    getLabel: function() {
    	return this.getUserData()["label"];
    },
    setPersistentAttributes: function(memento) {
    	this._super(memento);
    	this.setLabel(memento.userData.label);
    	this.setType(memento.userData.type);
    	this.setIp(memento.userData.ip);
    	this.setImage(memento.userData.image);
    },
    setupObject: function(type, label, width, height) {
        this.setDimension(width, height);
    	var tpl = new topologyIconPortLocator();
    	this.createPort("hybrid", tpl);
        this.setType(type);
        this.setLabel(label);
    },
    onContextMenu: function(x, y) {
        if(this.getType() == "junos") {
            items = {
                "getStartupState": {
                    name: "Get Bootup State"
                },
                "preconfigDevice": {
                    name: "Setup SSH + Netconf"
                },
                "configInterfaces": {
                    name: "Configure Interfaces"
                },
                "getConfig": {
                    name: "Dump Config"
                },
                "delete": {
                    name: "Delete"
                }
            };
        } else {
            items = {
                "delete": {
                    name: "Delete"
                }
            }
        }
        jQuery.contextMenu({
            selector: 'body',
            events: {
                hide: function() {
                    jQuery.contextMenu('destroy');
                }
            },
            callback: jQuery.proxy(function(key, options) {
                switch (key) {
                    case "delete":
                        // without undo/redo support
			            var ports = this.getPorts().asArray();
        		        for (i = 0; i < ports.length; i++) {
		                    this.removePort(ports[i]);
        		        }
                        this.getCanvas().removeFigure(this);
                        break;
		            case "configInterfaces":
		    	        console.log("configuring interfaces on " + this.getIp());
    		    	    // defined in templates/edit.html - parent page
    			        configDeviceInterfaces(this.getIp(), this.getPassword());
    			    break;
    		        case "preconfigDevice":
    			        console.log("preconfig on " + this.getLabel());
    			        // defined in templates/edit.html - parent page
    			        preconfigJunosDomain(this.getLabel(), this.getPassword(), this.getIp());
    			    break;
    		        case "getConfig":
    			        console.log("get config on " + this.getLabel());
    			        // defined in templates/edit.html - parent page
    			        getJunosConfig(this.getIp(), this.getPassword());
                    break;
    		        case "getStartupState":
    			        console.log("get startup start on " + this.getLabel());
    			        // defined in templates/edit.html - parent page
    			        getJunosStartupState(this.getLabel());
                    break;
                    default:
                        break;
                    }
                }, this),
            x: x,
            y: y,
            items: items
        });
    }
});
