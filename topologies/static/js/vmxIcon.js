draw2d.shape.node.vmxIcon = draw2d.shape.node.topologyIcon.extend({
    NAME: "draw2d.shape.node.vmxIcon",
    EDIT_POLICY: false,

    init: function(type, label, ip, pw, image) {
        var icon;
        var width = 50;
        var height = 50;
        icon = "/static/images/vmxIcon.png";
        this._super(type, label, ip, pw,image);
        this.setUserData({});
        this.setIp(ip);
        this.setImage(image);
        this.setPassword(pw);
        this.setupObject(type, label, width, height);
    }
});
