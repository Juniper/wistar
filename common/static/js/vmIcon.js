// provide a base class for all topology Icons
// provides only common attributes required by all virtual machines

draw2d.shape.node.vmIcon = draw2d.shape.basic.Image.extend({
    NAME: "draw2d.shape.node.vmIcon",
    EDIT_POLICY: false,
    VCPU: 2,
    VRAM: 2048,
  
    init: function(icon, width, height) {
	    this._super(icon, width, height);
    },
    getUserData: function() {
        if (this.userData != undefined) {
            return this.userData;
        } else {
            this.userData = {};
            return this.userData;
        }
    },
    getType: function() {
        if (this.getUserData()["type"] != undefined) {
	        return this.getUserData()["type"];
        } else {
            return "linux";
        }
    },
    setType: function(type) {
	    var ud = this.getUserData();
	    ud["type"] = type;
    },
    getCpu: function() {
        if (this.getUserData()["cpu"] != undefined) {
	        return this.getUserData()["cpu"];
        } else {
            // return magic number 2 - all older version of wistar defaulted to 2 vCPU
            return this.VCPU;
        }
    },
    setCpu: function(cpu) {
	    var ud = this.getUserData();
	    ud["cpu"] = cpu;
    },
    getRam: function() {
        if (this.getUserData()["ram"] != undefined) {
	        return this.getUserData()["ram"];
        } else {
            // return magic number 2 - all older version of wistar defaulted to 2048MB RAM
            return this.VRAM;
        }
    },
    setRam: function(ram) {
	    var ud = this.getUserData();
	    ud["ram"] = ram;
    },
    getMgmtInterface: function() {
        return "eth0";
    },
    getPassword: function() {
        if (this.getUserData()["password"] != undefined) {
        	return this.getUserData()["password"];
        } else {
            return "NA";
        }
    },
    setPassword: function(pw) {
    	var ud = this.getUserData();
    	ud["password"] = pw;
    },
    getImage: function() {
        if (this.getUserData()["image"] != undefined) {
        	return this.getUserData()["image"];
        } else {
            return "0";
        }
    },
    setImage: function(im) {
    	var ud = this.getUserData();
    	ud["image"] = im;
    },
    setIp: function(ip) {
        var ud = this.getUserData();
        ud["ip"] = ip;
    },
    getIp: function() {
        if (this.getUserData()["ip"] != undefined) {
            return this.getUserData()["ip"];
        } else {
            return "";
        }
    },
    getName: function() {
        if (this.getUserData()["name"] != undefined) {
    	    return this.getUserData()["name"];
        } else {
            return "unnamed_vm";
        }
    },
    setName: function(name) {
    	var ud = this.getUserData();
    	ud["name"] = name;
    },
    getLabel: function() {
        if (this.getUserData()["name"] != undefined) {
    	    return this.getUserData()["name"];
        } else {
            return "unnamed_vm";
        }
    },
    setPersistentAttributes: function(memento) {
    	this._super(memento);
    },
    getPersistentAttributes: function() {
        // force grabbing the mgnt interface
        var ud = this.getUserData();
        ud["mgmtInterface"] = this.getMgmtInterface();
        ud["wistarVm"] = true;
        if(ud["configurationFile"] == undefined) {
            ud["configurationFile"] = "domain.xml";
        }
        return this._super();
    },
    // override default dc handler
    onDoubleClick: function() {
        return;
    },
});
