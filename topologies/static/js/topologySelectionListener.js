var topologySelectionListener = Class.extend({
    NAME: "topologySelectionListener",
    init: function() {
        var selection = new draw2d.Selection();
    },
    onSelectionChanged: function(figure) {
        if (figure != null) {
            setSelectedObject(figure.getId());
            if (! isNewTopology()) {

                if (figure instanceof draw2d.Connection) {
                    console.log('found connection');
                    loadConnectionEditor(figure.getId());
	            } else if (figure instanceof draw2d.shape.basic.Line) {
	                console.log("found line");
	                loadLineEditor(figure.getId());
	            } else if (figure instanceof draw2d.shape.note.PostIt) {
	                console.log("found note");
	                loadPostItEditor(figure.getId());
	            } else if (figure instanceof draw2d.shape.basic.Label) {
	                console.log("found label");
	                loadLabelEditor(figure.getId());
	            } else if (figure instanceof draw2d.shape.node.topologyIcon) {
	                console.log("found topologyIcon");
	                if (figure.getType() == "junos_vmx" || figure.getType() == "junos_firefly" || figure.getType() == "junos_vmx_p2") {
	                    loadJunosIconEditor(figure.getId());
	                } else if(figure.getType() == "linux") {
	                    loadLinuxIconEditor(figure.getId());
                    } else {
	                    loadGenericIconEditor(figure.getId());
	                }
	                // hideSelection();
	            } else {
	                console.log("click on unknown object " + figure);
	                hideSelection();
	            }
	        } else {
	            hideSelection();
	        }
        }
    }
});
