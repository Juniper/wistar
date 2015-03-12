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

