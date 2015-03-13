    function launchWebConsole(domain) {
        var url = "/ajax/launchWebConsole/";
        var params = {
            'domain' : domain
        };

        var doc = jQuery(document);
        doc.css('cursor' , 'progress' );
        var success = function(response) {
            data = eval(response);
            console.log(data);
            doc.css('cursor' , '');
            if (data["result"] == false) {
                alert(data["message"]);
            } else {
               console.log("open a window");
               windowUrl = "/webConsole/" + data["port"]
               window.open(windowUrl);
            }
        };

        jQuery.post(url, params, success);

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

        // updateAllBootState();
    }
   
    // Simple function to update the deploymentStatusDiv with the current hypervisor state
    function manageDomain(action, domainId) {
        if (action == "stop") {
            if (! confirm("This will power off the instance ungracefully!")) {
                return false;
            }
        } else if (action == "undefine") {
            if (! confirm("This will delete this instance entirely!")) {
                return false;
            }
        }
        var url = '/ajax/manageDomain/';
        var params = {
            'topologyId' : '',
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
    }

    // Simple function to update the deploymentStatusDiv with the current hypervisor state
    function manageNetwork(action, networkName) {
        var url = '/ajax/manageNetwork/';
        var params = {
            'topologyId' : '',
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
    }

