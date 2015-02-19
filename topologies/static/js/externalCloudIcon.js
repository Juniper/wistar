externalCloudIconPortLocator = draw2d.layout.locator.PortLocator.extend({
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
    init: function(parent)
    {
        this._super(parent);
    },
    relocate: function(index, target)
    {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, parent.getHeight() - 45);
    }
});
draw2d.shape.node.externalCloudIcon = draw2d.shape.icon.Cloud2.extend({
    NAME: "draw2d.shape.node.externalCloudIcon",
    EDIT_POLICY: false,
   
    init: function() {
        this._super();
        var pl = new externalCloudIconPortLocator();
        this.createPort("hybrid", pl);
        this.setLabel("External");
    },
    setLabel: function(label) {
        l = new draw2d.shape.basic.Label(label);
        l.setColor("#000");
        l.setFontColor("#000");
        l.setStroke(0);
        this.addFigure(l, new externalCloudLabelLocator(this)); 
    },
    getLabel: function() {
        return "External";
    }
});

