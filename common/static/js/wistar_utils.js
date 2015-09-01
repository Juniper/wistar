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
            if (! confirm("This will power off the instance ungracefully!")) {
                return false;
            }
        } else if (action == "undefine") {
            if (! confirm("This will delete this instance entirely!")) {
                return false;
            }
        } else if (action == "suspend") {
            if (! confirm("This will suspend this domain! THIS IS EXPERIEMENTAL!")) {
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
       
        var cso = jQuery('<div/>').attr("id", "configTemplatesOverlay").addClass("screen-overlay");

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
