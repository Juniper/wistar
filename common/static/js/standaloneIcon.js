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
// provides a base class for all topology icons that will be 'standalone' ie not
// in a pair like vre / vpfe
// should not be instantiated directly, but rely on child classes
draw2d.shape.node.standaloneIcon = draw2d.shape.node.vmIcon.extend({
    NAME: "draw2d.shape.node.standaloneIcon",
    EDIT_POLICY: false,
   
    init: function(icon, width, height) {
	    this._super(icon, width, height);
    	var tpl = new topologyIconPortLocator();
    	this.createPort("hybrid", tpl);
        this.setBootState("down");

    },
    setup: function(type, label, ip, pw, image, cpu, ram) {
		// this.setUserData({});
        // shouldn't be necessary
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
    setLabel: function(label) {
        this.setName(label);
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
    	return this.getName();
    },
    setPersistentAttributes: function(memento) {
    	this._super(memento);
    }
});
