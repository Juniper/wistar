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
	            } else if (figure instanceof draw2d.shape.node.wistarVm) {
	                console.log("found wistarVm");
	                if (figure.getType().match('junos')) {
	                    loadJunosIconEditor(figure.getId());
	                } else if(figure.getType().match('linux')) {
	                    loadLinuxIconEditor(figure.getId());
                    } else {
	                    loadGenericIconEditor(figure.getId());
	                }
	                // hideSelection();
	            } else if (figure instanceof draw2d.shape.composite.Group) {
	            	console.log("found composite group");
	            	var assignedFigures = figure.getAssignedFigures();
	            	assignedFigures.each(function(i, z) {
	            		if (z instanceof draw2d.shape.node.wistarSetParent) {
	            			setSelectedObject(z.getId());
	            			if (z.getType().match('junos')) {
	                            loadJunosIconEditor(z.getId());
	                        } else if(z.getType().match('linux')) {
	                            loadLinuxIconEditor(z.getId());
                            } else {
	                            loadGenericIconEditor(z.getId());
	                        }
	            		}
	            	});
	            } else {
	                console.log("click on unknown object " + figure.NAME);
	                loadFigureEditor(figure.getId());
	            }

	        } else {
	            // new topology allow changing colors on some things!
	            /*
	            if ((figure instanceof draw2d.Connection) ||
                    (figure instanceof draw2d.shape.basic.Circle) ||
                    (figure instanceof draw2d.shape.basic.Rectangle))
                    */
                    if ((figure instanceof draw2d.Connection) ||
                     (figure instanceof draw2d.shape.basic.Circle) ||
                    (figure instanceof draw2d.shape.basic.Rectangle))
	            {
	                if (figure instanceof draw2d.shape.composite.Group) {
	                    // let's not allow editing of multi-VM
	                    hideSelection();
	                } else {
	                    loadFigureEditor(figure.getId());
	                }
	            } else {
	                console.log('hiding');
	                hideSelection();
	            }
	        }
        } else {
            alert('here');
	        hideSelection();
	    }
    }
});
