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
        var y = 1;
        target.setPosition(x, y);
    }
});
// provides a base class for all topology icons that will be 'standalone' ie not
// in a pair like vre / vpfe
// should not be instantiated directly, but rely on child classes
draw2d.shape.node.wistarStandalone = draw2d.shape.node.wistarVm.extend({
    NAME: "draw2d.shape.node.wistarStandalone",

    init: function() {
	    this._super();
    	var tpl = new topologyIconPortLocator();
    	this.createPort("hybrid", tpl);
        this.setBootState("none");
    },

    setBootState: function(state) {
        this.bootState = state;
        if (this.bootStateIcon == undefined && state != "none") {
            this.bootStateIcon = new draw2d.shape.basic.Circle();
            this.bootStateIcon.setBackgroundColor("#FF0000");
            this.bootStateIcon.setDimension(8, 8);
            this.addFigure(this.bootStateIcon, new BootStateLocator(this));
        }
        if (state == "up") {
            this.bootStateIcon.setBackgroundColor("#00FF00");
        } else if(state == "down") {
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
        console.log("SET LABEL On STANDALONE " + label);
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
    },
    getMgmtInterface: function() {
        if (this.MANAGEMENT_INTERFACE_LIST == 0) {
            return this.MANAGEMENT_INTERFACE_PREFIX + "0";
        } else {
            // FIXME this may need to be adjusted if there is ever a reason to have a management interface
            // that is something other than 0 or -1
            // this assumes -1 in the else
            var port = this.getPorts().get(0);
            var connections = port.getConnections();
            return this.MANAGEMENT_INTERFACE_PREFIX + connections.size;
        }
    },
});
