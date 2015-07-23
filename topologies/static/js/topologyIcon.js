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
BootStateLocator = draw2d.layout.locator.Locator.extend({
    init: function(parent) {
        this._super(parent);
    },
    relocate: function(index, target) {
        var node = this.getParent()
        var x = node.getWidth() - 11;
        var y = 3;
        target.setPosition(x, y);
    }
});
draw2d.shape.node.topologyIcon = draw2d.shape.basic.Image.extend({
    NAME: "draw2d.shape.node.topologyIcon",
    EDIT_POLICY: false,
   
    init: function(icon, width, height) {
	    this._super(icon, width, height);
    	var tpl = new topologyIconPortLocator();
    	this.createPort("hybrid", tpl);
        this.setBootState("down");
    },
     
    setup: function(type, label, ip, pw, image, cpu, ram) {
		this.setUserData({});
		this.setIp(ip);
        this.setImage(image);
		this.setPassword(pw);
		this.setType(type);
		this.setLabel(label);
		this.setCpu(cpu);
		this.setRam(ram);
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
    setType: function(type) {
	    var ud = this.getUserData();
	    ud["type"] = type;
    },
    getType: function() {
	    return this.getUserData()["type"];
    },
    setCpu: function(cpu) {
	    var ud = this.getUserData();
	    ud["cpu"] = cpu;
    },
    getCpu: function() {
        if (this.getUserData()["cpu"] != undefined) {
	        return this.getUserData()["cpu"];
        } else {
            // return magic number 2 - all older version of wistar defaulted to 2 vCPU
            return "2";
        }
    },
    setRam: function(ram) {
	    var ud = this.getUserData();
	    ud["ram"] = ram;
    },
    getRam: function() {
        if (this.getUserData()["ram"] != undefined) {
	        return this.getUserData()["ram"];
        } else {
            // return magic number 2 - all older version of wistar defaulted to 2048MB RAM
            return "2048";
        }
    },
    getMgmtInterface: function() {
        var port = this.getPorts().get(0);
        var connections = port.getConnections();
        mgmtInterfaceIndex = connections.size;
        if(this.getType() == "junos_vmx") {
            return "em0";
        } else if(this.getType() == "junos_vmx_p2") {
            return "fxp0";
        } else if(this.getType() == "junos_firefly") {
            return "ge-0/0/" + mgmtInterfaceIndex;
        } else if(this.getType() == "linux") {
            return "eth" + mgmtInterfaceIndex;
        } else {
            return "eth0";
        } 
    },
    setIp: function(ip) {
	    var ud = this.getUserData();
	    ud["ip"] = ip;
	    if (this.ipLabel == undefined) {
		    this.ipLabel = new draw2d.shape.basic.Label("\n" + ip);
	        this.ipLabel.setColor("#000");
        	this.ipLabel.setFontColor("#000");
        	this.ipLabel.setStroke(0);
        	this.addFigure(this.ipLabel, new BottomCenterLocator(this));
	    } else {
            this.ipLabel.text = "\n" + ip;
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
    // override default dc handler
    onDoubleClick: function() {
        return;
    },
    // GONEZO
    onContextMenuOLD: function(x, y) {
        // FIXME - add other junos types here as well
        if(this.getType() == "junos_vmx") {
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
                //"getConfig": {
                //    name: "Dump Config"
                //},
                "delete": {
                    name: "Delete"
                }
            };
        } else if(this.getType() == "junos_firefly") {
            items = {
                "getStartupState": {
                    name: "Get Bootup State"
                },
                "preconfigDevice": {
                    name: "Setup SSH + Netconf"
                },
                "preconfigFirefly": {
                    name: "Setup management Interface"
                },
                "delete": {
                    name: "Delete"
                }
            }
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
    			        preconfigJunosDomain(this.getLabel(), this.getPassword(), this.getIp(), this.getMgmtInterface());
    			    break;
    		        case "preconfigFirefly":
    			        console.log("firefly preconfig in " + this.getLabel());
    			        preconfigFirefly(this.getLabel(), this.getPassword(), this.getMgmtInterface());
    			    break;
    		        case "getConfig":
    			        console.log("get config on " + this.getLabel());
    			        // defined in templates/edit.html - parent page
    			        getJunosConfig(this.getIp(), this.getPassword());
                    break;
    		        case "getStartupState":
    			        console.log("get startup start on " + this.getLabel());
    			        // defined in templates/edit.html - parent page
    			        getJunosStartupState();
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
