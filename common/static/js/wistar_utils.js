    function launchWebConsole(domain) {
        var url = "/ajax/launchWebConsole/";
        var params = {
            'domain' : domain
        };

        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');

        var success = function(response) {
            data = eval(response);
            console.log(data);
            if (data["result"] == false) {
                alert(data["message"]);
            } else {
               console.log("open a window");
               windowUrl = "/webConsole/" + data["port"]
               window.open(windowUrl);
            }
        };

        var post = jQuery.post(url, params, success);
        post.always(function() {
            doc.css('cursor', '');
        });
    }

    // Simple function to update the deploymentStatusDiv with the current hypervisor state
    function refreshDeploymentStatus(topoId) {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');

        var url = '/ajax/refreshDeploymentStatus/';
        var params = {
            'topologyId' : topoId
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            jQuery('#deploymentStatus').empty().append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
        post.always(function() {
            doc.css('cursor', '');
        });
    }
    
    // Simple function to update the host load in the header
    function refreshHostLoad() {

        var url = '/ajax/refreshHostLoad/';
        var params = {
            'dummy' : "111278" 
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            jQuery('#hostLoad').empty().append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
    }
   
    function manageDomain(action, domainId, topoId) {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');
       
        if (action == "stop") {
            if (typeof s != 'undefined') {
                s.setBootState("down");
            }

            if (! confirm("This will power off the instance ungracefully!")) {
                doc.css('cursor', '');
                return false;
            }
        } else if (action == "undefine") {
            if (typeof s != 'undefined') {
                s.setBootState("down");
            }
            if (! confirm("This will delete this instance entirely!")) {
                doc.css('cursor', '');
                return false;
            }
        } else if (action == "suspend") {
            if (! confirm("This will suspend this domain! THIS IS EXPERIEMENTAL!")) {
                doc.css('cursor', '');
                return false;
            }
        }
        var url = '/ajax/manageDomain/';
        var params = {
            'topologyId' : topoId,
            'domainId' : domainId,
            'action' : action
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            jQuery('#deploymentStatus').empty().append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
        post.always(function() {
            doc.css('cursor', '');
        });
    }

    function manageNetwork(action, networkName, topoId) {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');

        var url = '/ajax/manageNetwork/';
        var params = {
            'topologyId' : topoId,
            'networkName' : networkName,
            'action' : action
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            jQuery('#deploymentStatus').empty().append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
        post.always(function() {
            doc.css('cursor', '');
        });
    }

    function loadConfigTemplates(topoId) {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');
       
        var cso = jQuery('<div/>').attr("id", "overlay").addClass("screen-overlay");

        jQuery('#content').append(cso);
 
        var url = '/ajax/getConfigTemplates/';
        var params = {
            'topologyId' : topoId
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            cso.append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
        post.always(function() {
            doc.css('cursor', '');
        });
    }

    function loadAvailableInstances(scriptId) {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');

        var cso = jQuery('<div/>').attr("id", "overlay").addClass("screen-overlay");

        jQuery('#content').append(cso);

        var url = '/ajax/getAvailableInstances/';
        var params = {
            'scriptId' : scriptId
        };
        var post = jQuery.post(url, params, function(response) {
            var content = jQuery(response);
            cso.append(content);
        });
        post.fail(function() {
            alert('Could not perform request!');
        });
        post.always(function() {
            doc.css('cursor', '');
        });
    }

    function closeAvailableInstances() {
        var c = jQuery('#availableInstancesOverlay');
        c.empty();
        c.removeClass("screen-overlay");
        c.remove();
    }

    function setCursor() {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', 'progress');
    }

    function resetCursor() {
        var doc = jQuery(document.documentElement);
        doc.css('cursor', '');
    }

    function redir(url) {
        setCursor();
        window.location = url;
    }

    // removes non alpha numeric and compacts whitespace to single space
    function clean_string(input_object) {
        var input_string = input_object.value;
    
        //  remove all non alpha numeric
        var first_pass = input_string.replace(/[^a-zA-Z0-9_\ ]/g, "");
        var second_pass = first_pass.replace(/\s+/g, " ");
        var third_pass = second_pass.replace(/\s+$/, "");
        input_object.value = third_pass;
    }

    // cleans the string and leaves no white space at all
    function clean_string_no_space(input_object) {
        var input_string = input_object.value;

        //  remove all non alpha numeric
        var first_pass = input_string.replace(/[^a-zA-Z0-9_\ ]/g, "");
        var second_pass = first_pass.replace(/\s+/g, "_");
        var third_pass = second_pass.replace(/\s+$/, "");
        input_object.value = third_pass;
    }

    // removes non alpha numeric and compacts whitespace to single space
    function clean_string_no_special(input_object) {
        var input_string = input_object.value;

        //  remove all non alpha numeric
        var first_pass = input_string.replace(/[^a-zA-Z0-9_\ \.\\\#\-_\/]/g, "");
        var second_pass = first_pass.replace(/\./g, "_");
        input_object.value = second_pass;
    }

    // remove special chars and enforces first character is alpha
    function clean_string_first_alpha(input_object) {
        var input_string = input_object.value;

        //  remove all non alpha numeric
        var first_pass = input_string.replace(/[^a-zA-Z0-9_\ \.\\\#\-_\/]/g, "");
        var second_pass = first_pass.replace(/\./g, "_");
        var third_pass = second_pass.replace(/^([0-9])/, 'z$1')
        input_object.value = third_pass;
    }

     // removes non alpha
    function numeric_only(input_object) {
        var input_string = input_object.value;

        //  remove all non alpha numeric
        var first_pass = input_string.replace(/[^0-9]/g, "");

        input_object.value = first_pass;
    }
    
