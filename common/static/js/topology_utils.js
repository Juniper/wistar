

function setImageType() {
    id = jQuery('#topoIconImageSelect').val().split(':')[0]
    type = jQuery('#topoIconImageSelect').val().split(':')[1]
    console.log("Setting image to " + id + " and type to " + type);
    jQuery('#topoIconType').val(type);
    jQuery('#topoIconImage').val(id);

    // by default, let's hide some things
    jQuery('#addInstanceTbodyCloudInit').css("display", "none");
    jQuery('#addInstanceTbodyResize').css("display", "none");
    jQuery('#addInstanceTbodyVFPC').css("display", "none");
    jQuery('#addInstanceTbodySecondaryDisk').css("display", "none");

    // let's also zero out a couple of optional params
    jQuery('#topoIconScriptSelect').val(0);
    jQuery('#topoIconScriptParam').val(0);
    jQuery('#topoIconResize').val(0);

    for (v=0;v<vm_types.length;v++) {
        vm_type = vm_types[v];
        if (vm_type.name == type) {

            var icon = eval("new " + vm_type.js + "()" );

            console.log(icon);

            jQuery('#topoIconCpu').val(icon.VCPU);
            jQuery('#topoIconRam').val(icon.VRAM);

            // FIXME - we may actually never have a need for 'image' selectable types again!
            // just generate the disks images we need!
            if (icon.getSecondaryDiskParams() != "") {
                var params = icon.getSecondaryDiskParams();
                type = params["type"];
                if (type == "image") {
                    filter = params["filter"];
                    jQuery('#addInstanceTbodySecondaryDisk').css("display", "");
                    filterCompanionSelect(filter, "topoIconSecondaryDisk");
                }
            }

            if (icon.getTertiaryDiskParams() != "") {
                var params = icon.getTertiaryDiskParams();
                var type = params["type"];
                if (type == "image") {
                    filter = params["filter"];
                    jQuery('#addInstanceTbodyTertiaryDisk').css("display", "");
                    filterCompanionSelect(filter, "topoIconTertiaryDisk");
                }
            }

            if (typeof icon.setChildId != "undefined") {
                jQuery('#addInstanceTbodyVFPC').css("display", "");
                filterCompanionSelect(icon.COMPANION_NAME_FILTER, "topoIconImageVFPCSelect");
            }

            if (icon.CLOUD_INIT_SUPPORT) {
                jQuery('#addInstanceTbodyCloudInit').css("display", "");
            }

            if (icon.RESIZE_SUPPORT) {
                jQuery('#addInstanceTbodyResize').css("display", "");
            }
        }
    }
}

function addIconAndClose() {
    rv = addIcon();
    if (rv == true) {
        hideOverlay('#add_vm_form');
        hideOverlay('#overlayPanel');
    }
    // zero out all optional params as well, so they don't sneak in any other image types where they would
    // normally be hidden and zero anyway
    jQuery('#topoIconScriptSelect').val(0);
    jQuery('#topoIconScriptParam').val(0);
    jQuery('#topoIconResize').val(0);

}

// add icon to the topology with the indicated values
function addIcon() {
    var ip = nextIp();

    if (ip == null) {
        return;
    }

    var user = jQuery('#topoIconUser').val();
    var pw = jQuery('#topoIconPass').val();
    var name = jQuery('#topoIconName').val();
    var type = jQuery('#topoIconType').val();
    var image = jQuery('#topoIconImage').val();
    var cpu = jQuery('#topoIconCpu').val();
    var ram = jQuery('#topoIconRam').val();
    //var iconData = jQuery('#topoIconIcon').val();

    if (image == 0) {
        alert('Please select a valid image');
        return false;
    }
    var scriptId = jQuery('#topoIconScriptSelect').val();
    var scriptParam = jQuery('#topoIconScriptParam').val();

    var resize = jQuery('#topoIconResize').val();

    var vpfe_image = jQuery('#topoIconImageVFPCSelect').val();

    // enforce names always end with a digit
    var last = name.substr(-1);
    var lastInt = parseInt(last);
    if (isNaN(lastInt)) {
        alert('Name must end in a digit');
        jQuery('#topoIconName').val(name + "1");
        jQuery('#topoIconName').focus();
        return false;
    }

    if (name == "") {
        alert("Please add a valid instance name");
        return false;
    }

    var icon;

    vm_type_data = {};
    for (v=0;v<vm_types.length;v++) {
        vm_type = vm_types[v];
        if (vm_type.name == type) {
            vm_type_data = vm_type;
            break;
        }
    }
    console.log(vm_type_data);

    icon = eval("new " + vm_type_data.js + "()" );

    // Should the user have selected a companion image?
    if (icon.getCompanionType() != "") {
        // yes, did they?
        if (vpfe_image == 0) {
            // uh-oh!
            alert('Please select a Companion Image before continuing!');
            return false;
        }
    }

    // simple algorithm to add icons to the screen without overlapping
    lastX += 100;
    lastY += 0;
    vmxCount += 1;
    iconCount += 1;

    if (iconCount > iconWrapLimit) {
        lastX = 50;
        lastY = iconOffset;
        iconCount = 1;
        iconOffset += 110;
    }

    icon.setup(type, name, ip, user, pw, image);

    icon.setCpu(cpu);
    icon.setRam(ram);

    // set the resize value in userData dict
    icon.setUserDataKey('resize', resize);

    // set the scriptId in the
    if (scriptId != 0) {
        icon.setUserDataKey('configScriptId', scriptId);
        icon.setUserDataKey('configScriptParam', scriptParam);
    }

    if (icon.getSecondaryDiskParams() != "") {
        var params = icon.getSecondaryDiskParams();
        var type = params["type"];
        if (type == "image") {
            params["image_id"] = jQuery('#topoIconSecondaryDisk').val();
            icon.setSecondaryDiskParams(params);
        }
    }

    if (icon.getCompanionType() != "") {

        var vpfe_cpu = jQuery('#topoIconVFPCCpu').val();
        var vpfe_ram = jQuery('#topoIconVFPCRam').val();
        var vpfe_js = jQuery('#topoIconVFPCJs').val();
        var vpfe_type = jQuery('#topoIconVFPCType').val();

        // attempt to load vpfe as the selected image_id type
        // otherwise, use the default companion_type
        if (vpfe_js == '') {
            vpfe_js = icon.COMPANION_TYPE;
        }

        var vpfe = eval("new " + vpfe_js + "()" );

        vpfe_ip = nextIp();

        vpfe.setup(vpfe_type, name, vpfe_ip, user, pw, vpfe_image);

        vpfe.setCpu(vpfe_cpu);
        vpfe.setRam(vpfe_ram);
        // bind them together here!

        if (typeof vpfe.setParentId != 'undefined') {
            console.log("vpfe is actually a child!");
            console.log(vpfe.NAME);
            vpfe.setParentId(icon.getId());
            icon.setChildId(vpfe.getId());

            canvas.add(vpfe, lastX, lastY + 15);
        } else {
            alert("Companion Doesn't appear to be a valid companion image type!");
            return false;
        }

        canvas.add(icon, lastX, lastY);

        figures = new draw2d.util.ArrayList([icon, vpfe]);
        var cg = new draw2d.command.CommandGroup(canvas, figures);
        cg.execute();

        // work around, ports are being drawn as hidden until they are clicked!
        vpfe.getPorts().first().toFront();

    } else {
        canvas.add(icon, lastX, lastY);
    }

    // let's try to increment everything nicely
    jQuery('#topoIconName').val(incrementIconName(name));

    return true;
}


var ip_floor = 2;
var dhcp_floor = ip_floor;

// convenience func to increment icon name if it happens to end
// in a digit
function incrementIconName(name) {
    var last = name.substr(-1);
    var lastInt = parseInt(last);
    if (last == "9") {
        var lastTwo = name.substr(-2);
        var lastTwoInt = parseInt(lastTwo);
        if (! isNaN(lastTwoInt)) {
            return name.substring(0, name.length -2) + (lastTwoInt + 1);
        } else {
            // last two are not an int, check for single digit suffix
            if (! isNaN(lastInt)) {
                return name.substring(0, name.length -1) + (lastInt + 1);
            } else {
                return name + "2";
            }
        }
    } else {
        if (! isNaN(lastInt)) {
            return name.substring(0, name.length -1) + (lastInt + 1);
        } else {
            return name + "2";
        }
    }
}

function addLabel() {

    var label = jQuery('#newLabel').val();
    var labelSize = jQuery('#newLabelFontSize').val();
    var l = new draw2d.shape.basic.Label({ text: label });
    // l.setBackgroundColor();
    l.setFontColor("#000000");
    l.setFontSize(labelSize);
    l.setStroke(0);

    // simple algorithm to add icons to the screen without overlapping
    lastX += 100;
    lastY += 0;
    iconCount += 1;

    if (iconCount > iconWrapLimit) {
        lastX = 50;
        lastY = iconOffset;
        iconCount = 1;
        iconOffset += 110;
    }
    canvas.add(l, lastX, lastY);
    hideOverlay("#add_label_form");
}

function filterCompanionSelect(filter_string, select_name) {
    var filter_regex = RegExp(filter_string, 'i');
    var companion_select = jQuery('#' + select_name);
    companion_select.empty();
    companion_select.append('<option value="0">None</option>');
    for (index in images) {
        var image_name = images[index]["fields"]["name"];
        var image_id = images[index]["pk"];
        if (image_name.match(filter_regex)) {
            companion_select.append('<option value="' + image_id + '">' + image_name + '</option>');
        }
    }
}

function setCompanionParams(o) {
    var companion_image = jQuery('#topoIconImageVFPCSelect').val();
    console.log(companion_image);
    var companion_type = "blank";
    for(i=0;i<images.length;i++) {

        if(images[i]["pk"] == companion_image) {
            companion_type = images[i]["fields"]["type"];
            console.log(companion_type);
            break;
        }
    }
    // set the companion type here to be used later
    jQuery('#topoIconVFPCType').val(companion_type);

    for (v=0;v<vm_types.length;v++) {
        vm_type = vm_types[v];
        console.log(vm_type.name);
        if (vm_type.name == companion_type) {
            console.log('found it');
            var companion = eval("new " + vm_type.js + "()");

            jQuery('#topoIconVFPCCpu').val(companion.VCPU);
            jQuery('#topoIconVFPCRam').val(companion.VRAM);
            jQuery('#topoIconVFPCJs').val(companion.NAME);

            break;
        }
    }
}