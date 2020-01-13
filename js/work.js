function MakeChangeTree(parentdatapoint) {

	//instanciate a treeinstance by flatterneddatapoints_sortedrowscols.
    // console.log(rootdatapoint)
    
    // treeinstance = d3.tree().size([height_tree, width_tree]);// don't put it inside MakeChangeTree, as the bynodessize () method requires a different line (.nodeSize() instead of .size())

    // console.log('rootdatapoint_sortedrowscols ======')
	// console.log(rootdatapoint_sortedrowscols)

	// var treeinstance_rootdatapoint = treeinstance(rootdatapoint);	//v4
	var treeinstance_rootdatapoint = treeinstance(rootdatapoint_sortedrowscols);	//v4

	// Compute the new tree layout.
	var nodes = treeinstance_rootdatapoint.descendants(), links = treeinstance_rootdatapoint.descendants().slice(1); //v4
	//links is almost the same as nodes, just removing the first element by slice(1) (the first element of nodes does not have a parent to link to)
    // console.log('nodes ======')
    // console.log(nodes)
    // console.log('links ===')
    // console.log(links)


	// redefine nodes.y, make it 180 apart from each other
	nodes.forEach(function(d) { d.y = d.depth * between_nodes_horizontal; });

	//join (link data to empty g elements)
	var node = thetreeG.selectAll("g.nodeGs") // note that it is to select all elements within g with the classname = nodeGs
        .data(nodes, function(d) { return d.id || (d.id = ++i); }); // each data point was assigned an id (d.id)
    // console.log('node ======')
    // console.log(node)

	//enter (add g elements according to joined node)
	var nodeEnter = node.enter().append("g")
        .attr("class", "nodeGs")
		.attr("transform", function(d) {
			return "translate(" + parentdatapoint.y0 + "," + parentdatapoint.x0 + ")"; }) //each g are added at the position x0,y0 of the source data
		.on("click", showhidedescendants)
        .on('contextmenu', d3.contextMenu(nodemenu))//ZoomInOutSelectedNode) // right click to zoom in/out
        .on("mousedown", dragdrop)  //check the newest version of dragdrop in components.js
    ;
    // console.log('nodeEnter ======')
    // console.log(nodeEnter)	
	
	//add circle within g.nodeGs
	nodeEnter.append("circle")
		.attr('class', 'nodecircles')
        .attr("r", 1e-6) // initial size is nearly 0
        .attr("stroke-width", nodecircle_border_width)
        .attr('stroke', nodecircle_border_color)
		.style("fill", function(d) {
            return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color; });
            
    // add symbols into g.nodeGs (e.g., a rectale to indicate substeps, etc)
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({'class': 'nodesymbolGs_substeps'})
        .attr('transform', 'translate (20, -8)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class','nodesymbol_substeps')
        .attr('width', 6)
        .attr('height',0)
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({'class': 'nodesymbolGs_video'})
        .attr('transform', 'translate (-24, -8)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class','nodesymbol_video')
    //     .attr('width', 6)
    //     .attr('height',6)
    //     .attr("xlink:href", "pix/video.png")
    // nodeEnter.append('g') // add a group element to hold the substeps symbol
    //     .attrs({'class': 'nodesymbolGs_warning'})
    //     .attr('transform', 'translate (-22, -16)') // move to 2 o'clock of the node circle
    //     .append("svg:image")
    //     .attr('class','nodesymbol_warning')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/warning.png")
    // nodeEnter.append('g') // add a group element to hold the substeps symbol
    //     .attrs({'class': 'nodesymbolGs_question'})
    //     .attr('transform', 'translate (-14, -19)') // move to 2 o'clock of the node circle
    //     .append("svg:image")
    //     .attr('class','nodesymbol_question')
    //     .attr('width', 10)
    //     .attr('height',10)
    //     .attr("xlink:href", "pix/question.png")
    // nodeEnter.append('g') // add a group element to hold the substeps symbol
    //     .attrs({'class': 'nodesymbolGs_learning'})
    //     .attr('transform', 'translate (-4, -22)') // move to 2 o'clock of the node circle
    //     .append("svg:image")
    //     .attr('class','nodesymbol_learning')
    //     .attr('width', 8)
    //     .attr('height',8)
    //     .attr("xlink:href", "pix/learning.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({'class': 'nodesymbolGs_code'})
        .attr('transform', 'translate (4, -20)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class','nodesymbol_code')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/code.png")
	// nodeEnter.append('g') // add a group element to hold the substeps symbol
    //     .attrs({'class': 'nodesymbolGs_info'})
    //     .attr('transform', 'translate (12, -16)') // move to 2 o'clock of the node circle
    //     .append("svg:image")
    //     .attr('class','nodesymbol_info')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/info.png")

    
	// add text into g.nodeGs> instead of <text>, use foreignObject, and div which is more flexible for multiple lines and text formating
    nodeEnter.append('g') // has to wrap the div inside a g element so as to transform (adjust the text label's position relative to the node)
        // .transition().duration(2)
        .attr('class', 'nodetextGs')
        .attr('transform', 'translate (-80, 10)') // to move the text g box back (under nodes and centered)
        .append('foreignObject').attr('width', 160).attr('height', '50')
        .append('xhtml:div')
        .attr('class', 'nodetext')
        .text(function(d) { return d.data.name; }) //v4
        .style('font-family', 'sans-serif')
        .style('font-size', '0em')
        .style('line-height', '110%')
        .style("opacity", 1e-6)
        .style('text-align', 'center') //both should be specified

	
	// update (change properties of the g.nodeGs elements, including x/y coordinate, size, color, etc)
     var nodeUpdate = nodeEnter.merge(node); // d3v4
    //  console.log('nodeUpdate ======')
    //  console.log(nodeUpdate)

	nodeUpdate.transition() //v4
		.duration(showhidedescendants_duration)
		.attr("transform", function(d) { 
			return "translate(" + d.y + "," + d.x + ")"; 
		});

	// update (change properties of the ciricle elements, including x/y coordinate, size, color, etc)
	nodeUpdate.select("circle.nodecircles")
		.transition().duration(showhidedescendants_duration)
		.attr("r", nodecircle_radius)
		.style("fill", function(d) { 
			return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color; 
        })
        .style("stroke", function(d){return (d.data.NodeDescription?"blue":nodecircle_border_color)}) //d3v4 show different color on whether or not having description
        ;

    // update whether or not to show the symbol for substeps
    nodeUpdate.select("image.nodesymbol_substeps")
         .attr('height',d=>{
                return d.data._substeps ? 6 : 1e-6;
        })
        .attr("xlink:href", d=>{
            return d.data._substeps ? "pix/subdiagram.png" : null;
        })

    // update whether or not to show the symbol for video
    nodeUpdate.select("image.nodesymbol_video")
        // depends on whether d.data.NdeDescription contains the text '<iframe class="ql-video"' which is 
            // a characteristic that the descriton contains a video iframe
        .attr('width', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')){
                return 6
            } else {
                return 1e-6
            }
        })
        .attr('height', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')){
                return 6
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')){
                return "pix/video.png"
            } else {
                return null
            }
        })
        // depends on whether d.data.NdeDescription contains the text '<div class="ql-code-block-container"' which is 
            // a characteristic that the descriton contains code (text in code format)
        nodeUpdate.select("image.nodesymbol_code")
        // depends on whether d.data.NdeDescription contains the text '<div class="ql-code-block-container"' which is 
            // a characteristic that the descriton contains code (text in code format)
        .attr('width', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')){
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('height', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')){
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d=>{
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')){
                return "pix/code.png"
            } else {
                return null
            }
        })
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/code.png")

	//update (change properties of the text elements, including x/y coordinate, size, color, etc)
	nodeUpdate.select("div.nodetext")
		.transition().duration(showhidedescendants_duration)
		.style("opacity", 1)
        .style("font-size", nodetext_font_size)
        .style('color', d=>{ // if the description contains [to do], turn label into red color
            var theCheckToDo=checkToDo(d);
			if (theCheckToDo===1){return "red";}else{return "black";}
        })
		;
		
	/** exit g groups (For the elements that are not joined in node, make them travel back to the coordinate x y of 
	 * the parentdatapoint, then remove these unbinded elements)*/
	var nodeExit = node.exit()
		.transition()
		.duration(showhidedescendants_duration)
		.attr("transform", function(d) { 
			return "translate(" + parentdatapoint.y + "," + parentdatapoint.x + ")"; 
		})
		.remove();

	//exit text groups, shrine the radius of the circle to nearly 0
	nodeExit.select("circle.nodecircles")
		.attr("r", 1e-6);
		
	//exit text groups, changetext opacity to nearly 0, also reduce the font-size to nearly 0
	nodeExit.select("div.nodetext")
		.style("opacity", 1e-6)
		.style("font-size", "0em")
		;


	/*******************************make links *********************** */	

    // join (link data to empty path elements) 
    // think about putting all class names in the init.class. That way, the class name change can be done in one place
	var link = thetreeG.selectAll("path.primarylinks")
		.data(links, function(d) { return d.id; }); //v4  d.id can befound in _enter => 0:q => __data .id, which is corresponding to the d.id in node object
    // console.log('link ===')
    // console.log(link)

	// enter (add path elements according to joined link)
	var linkEnter = link.enter().insert('path', "g") //v4
		.attr("class", "primarylinks")
		.attr("stroke-opacity", 1e-6)
		.attr("d", function(d) {
			var o = {x: parentdatapoint.x0, y: parentdatapoint.y0};
			return diagonal(o,o); //v4 // initially, let the s (source) and d(destination) coordinates of the path be the same: x0, y0 of the parentdatapoint
		});
    // console.log('linkEnter ===')
    // console.log(linkEnter)
    
	/* update (change waypoints of the path, 
		i.e., recalculating the path waypoints at any time during the transition) */
	var linkUpdate = linkEnter.merge(link); //d3v4
	linkUpdate.transition()
		.duration(showhidedescendants_duration)
		.attr("stroke-opacity", 1)
		.attr('d', function(d){ return diagonal(d.parent, d)}); 
		// attr('d', ..) is the final path after transition, it is from x,y coordinate of the parentnode to x,y of the current node

	// exit, make transition by changing the path waypoints towards the parent node, and eventually remove the path lines
	link.exit().transition()
		.duration(showhidedescendants_duration)
		.attr("stroke-opacity", 1e-6)
		.attr("d", function(d) {
			var o = {x: parentdatapoint.x, y: parentdatapoint.y};
			return diagonal(o, o); // v4 it is the final path after transition: all waypionts are at the x,y of the parentdatapoint	
		})
        .remove();        
	
	/**update x0, y0 ********************************************************************************/
	// for each data element, update the x0 and y0 as the current d.x, and d.y, so as to toggle between expansion/collaspe
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
    });
    
    //save all d.x, to be used for adjust horizontal shift error caused by tree().nodeSize() method
    var vcoords=[];
    nodes.forEach(d=>{vcoords.push(d.x)});

    var results={
        'vcoords': vcoords,
        'nodeupdate': nodeUpdate
    }

    //there might be additional pseudolinks that are not cleaned
    d3.selectAll('path.pseudolinks').remove()

    return results;
} // end of MakeChangeTree