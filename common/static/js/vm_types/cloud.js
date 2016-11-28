externalCloudPortLocator = draw2d.layout.locator.PortLocator.extend({
    NAME: "externalCloudPortLocator",
    init: function() {
        this._super();
    },
    relocate: function(index, figure) {
        var node = figure.getParent();
        var x = node.getWidth() / 2;
        var y = node.getHeight() - 18;
        this.applyConsiderRotation(figure, x, y);
    }
});
externalCloudLabelLocator = draw2d.layout.locator.Locator.extend({
    NAME: "externalCloudLabelLocator",
    init: function(parent)
    {
        this._super(parent);
    },
    relocate: function(index, target)
    {
        var parent = target.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, parent.getHeight() - 45);
    }
});
draw2d.shape.node.externalCloud = draw2d.shape.icon.Cloud2.extend({
    NAME: "draw2d.shape.node.externalCloud",
    EDIT_POLICY: false,
   
    init: function(label) {
        this._super();
        this.setUserData({});
        this.setup(label);
    },
    setup: function(label) {
        var pl = new externalCloudPortLocator();
        this.createPort("hybrid", pl);
        this.setLabel(label);
    },
    setLabel: function(label) {
        var ud = this.getUserData();
        ud["label"] = label;
        l = new draw2d.shape.basic.Label({ text: label });
        l.setColor("#000");
        l.setFontColor("#000");
        l.setStroke(0);
        this.add(l, new externalCloudLabelLocator(this), 1);
    },
    getLabel: function() {
        return this.getUserData()["label"]
    },
    getInterfacePrefix: function() {
        return "br";
    },
    getIp: function() {
        return "0/0";
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setLabel(memento.userData.label);
    },
});
draw2d.shape.node.internalCloud = draw2d.shape.node.externalCloud.extend({
    NAME: "draw2d.shape.node.internalCloud",
    EDIT_POLICY: false,
    
    init: function(label) {
        this._super();
        this.setup(label);
    },
    setup: function(label) {
        var pl = new externalCloudPortLocator();
        this.createPort("hybrid", pl);
        this.setLabel(label);
    },
    getLabel: function() {
        return this.getUserData()["label"]
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setLabel(memento.userData.label);
    },
     getInterfacePrefix: function() {
        return "bridge";
    },
     getIp: function() {
        return "0/0";
    },
});
