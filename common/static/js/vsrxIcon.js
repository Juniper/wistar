draw2d.shape.node.vsrxIcon = draw2d.shape.node.standaloneIcon.extend({
    NAME: "draw2d.shape.node.vsrxIcon",
    EDIT_POLICY: false,

    init: function() {
        var width = 50;
        var height = 50;
        // fixme - rename to vsrx.png
        var icon = "/static/images/firefly.png";
        this._super(icon, width, height);
    },
    setup: function(type, label, ip, pw, image, cpu, ram) {
        this.setImage(image_id);
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
    getPersistentAttributes: function() {
        // force grabbing the mgnt interface
        var ud = this.getUserData();
        ud["mgmtInterface"] = this.getMgmtInterface();
        ud["wistarVm"] = true;
        ud["configurationFile"] = "domain_firefly.xml";
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
        this.setLabel(memento.userData.label);
    }
});
