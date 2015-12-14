draw2d.shape.node.vmxIcon = draw2d.shape.node.standaloneIcon.extend({
    NAME: "draw2d.shape.node.vmxIcon",
    EDIT_POLICY: false,

    init: function() {
        var width = 50;
        var height = 50;
        var icon = "/static/images/vmx.png";
        this._super(icon, width, height);
    },
    setup: function(type, label, ip, pw, image, cpu, ram) {
        this.setImage(image);
        this.setLabel(label);
        this.setType(type);
        this.setPassword(pw);
        this.setCpu(cpu);
        this.setRam(ram);
        this.setIp(ip);
    },
    getMgmtInterface: function() {
        return "em0";
    },
    setPersistentAttributes: function(memento) {
        this._super(memento);
        this.setImage(memento.userData.image);
        this.setType(memento.userData.type);
        this.setPassword(memento.userData.password);
        this.setCpu(memento.userData.cpu);
        this.setRam(memento.userData.ram);
        this.setIp(memento.userData.ip);
        this.setLabel(memento.userData.name);
        this.setName(memento.userData.name);
    }
});
