// add title and descriptions
function addtitledesc (){
	// add the h2 title
	d3.select('body')
	.append('h2')
	.attr('class', 'pagehead')
	.text('D3 try ' + window.location.href)
	;

	d3.select('body')
	.append('p')
	.attr('class', 'headdesc')
	.text('commit ' + gitcommitversion + ' to https://github.com/junkthem/simple_d3tree_v3tov4.io ')
}

/* This part is to load json str and save to a sessionStorage item. That way to avoid the async issue
	the trick is to get json object by d3.json(), and save into a sessionStorage item
	This is the only way I know that works in getting the stringified json out of d3.json()
*/
function loadjson (url) {
	d3.json(url, function(err, srcjson) {
		if (err) throw error;
		// var jsonstr = JSON.stringify(srcjson)
		tmptxt=JSON.stringify(srcjson);
		//console.log(tmptxt)
		sessionStorage.setItem("loadedjsonstr", tmptxt);
		/*Note: the trick is to show the sessionStorage item in console.log
			if not show it in console.log, the reload will not be fired (started)*/
		console.log(sessionStorage.getItem("loadedjsonstr"))
		if (sessionStorage.getItem("loadedjsonstr") === null ){
			document.location.reload();
		}
	});
}


/** get the loaded jsonstr from a sessionStorage item, parse the jsonstr to a JSON obj, and save it to treeJSON
 * Note:
 * 1. the following code lines are in a function, can be put into the separate file (components.js), such to keep 
    the modules.js neat.  
 * 2. the function is in IFFE (Immediately invoked function expression) style (https://en.wikipedia.org/wiki/Immediately_invoked_function_expression)
	IFFE style can return values without asynchronous issues.
 */

const getJsonFromSessionStorage  = (function () {
	// 1. load json inot a sessionStorage item (loadedjsonstr)
	loadjson (treejsonURL); //Note: the loadjson() has to run within getJsonFromSessionStorage Otherwise the sessionStorage Item cannot properly work.
    /* again the trick is to show the sessionStorage item in console.log. If not, the sessionStorage item will be null
		and the page is not reloaded*/
    console.log(sessionStorage.getItem("loadedjsonstr"))
    if (sessionStorage.getItem("loadedjsonstr") === null ){
        document.location.reload();
    }
    var loadedjsonstr = sessionStorage.getItem("loadedjsonstr");
    // console.log(loadedjsonstr)
    sessionStorage.removeItem("loadedjsonstr")
    return JSON.parse(loadedjsonstr);
})()

/**add a new element */
function addnewEle (width, height, id, clss, theparent, parentEleType, EleType, transfm ) {
	if (theparent === null ) {
		theparent = d3.select(parentEleType);
	}
	//console.log(theparent)
	var newEle = theparent.append(EleType)
	//its size = the size of tree diagram + margins
	.attr("width", width)
	.attr("height", height )
	.attr("id", id)
	.attr("class", clss)
	.attr("transform", transfm)
	;
	return newEle;	
}

/*make and update tree */
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
        .on('contextmenu', ZoomInOutSelectedNode) // right click to zoom in/out
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
     var nodeUpdate = nodeEnter.merge(node); // v4
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
			.style(
			"fill", 
			function(d) { 
				return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color; 
			}
		);
	
	//update (change properties of the text elements, including x/y coordinate, size, color, etc)
	nodeUpdate.select("div.nodetext")
		.transition().duration(showhidedescendants_duration)
		.style("opacity", 1)
		.style("font-size", nodetext_font_size)
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
    return results;
} // end of MakeChangeTree


// the diagonal path
/******migration to D3V4 part 15*/
// var diagonal = d3.svg.diagonal().projection(function(d) {return [d.y, d.x];});//v3
// the diagonal() is no longer available, instead, make a diagonal function 
//diagnonal(s, d), i.e., s=source, d=destination.
function diagonal(s, d) {
	path = `M ${s.y} ${s.x}
			C ${(s.y + d.y) / 2} ${s.x},
			  ${(s.y + d.y) / 2} ${d.x},
			  ${d.y} ${d.x}`  
	return path
} // v4
/***end ***migration to D3V4 part 15*/

// Toggle children on click.
function showhidedescendants(d) {
	//console.log("a node is clicked");
    //console.log(d);
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  var updateTree = MakeChangeTree(d);
  custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
}	


/****make custlinks *********************** */
function custlink(parentdatapoint, shownnodes){

    // get customized parents 
    //loop for each node in tmpnodes
    var custlinks_crude =[]; /**have all custlinks from the available nodes. It is called '_crude' as some may not have the source/targe node of the link showing in the tree map */
    var shownnodesData =[] //prepare an array of data binding to the shown nodes
    // console.log('shownnodes=======')
    // console.log(shownnodes)

    shownnodes.attr('fakeattr', d=>{ // a trick to get binded data from d3 obj

        //get a collection of data binding to the shown nodes
        shownnodesData.push(d)

        if (d.data.custparents){ // if the current data has custparents 
            var thecustparents = d.data.custparents;
            thecustparents.forEach(c=>{ //(note, there could be multiple!)
                var thecustlink ={}, tmp={}, tmpdata={};
                //get data.idx of the parent from d.data.custparents. Note: .custparents only contains idx of the custparents
                tmp.data=tmpdata;
                tmp.data.idx=c.idx;
                thecustlink.parent=tmp; // the above three lines are to create layers like thecustlink.parent.data.idx, which is to simulate the structure of the tree data
                //get the idx of the custlink
                thecustlink.data = d.data;
                thecustlink.x = d.x;
                thecustlink.y = d.y;
                custlinks_crude.push(thecustlink)
            })
        }
    }) 

    // console.log('custlinks_crude ====')
    // console.log(custlinks_crude)
    // console.log('shownnodesData ====')
    // console.log(shownnodesData)


    // check and only keep custlinks if itself and its parent exists in nodes. (The match has to be done by idx)
    var validcustlinks=[];

    // for each custlinks:
    custlinks_crude.forEach(d =>{ // d is a crude custlink
        // console.log('crude custlink ===')
        // console.log(d)
        shownnodesData.forEach(n=>{  // n is a node shown in the tree
            // console.log('entered node ===')
            // console.log(n)

            //1 check if the source node's parent is a child of target node
            if (d.parent.data.idx === n.data.idx){ // if n and d.parent have the same idx
                // console.log('in custlink.parent =========')
                // console.log(d.parent.data.idx )
                // console.log('in node =========')
                // console.log(n.data.idx, n.data.name)

            var d_ChildOf_n = 0;

                // if the source note is custlink.parent do not make custlink (if the source/target of a custlink are indeed parent-child, a default link has been added by MakeChangeTree, no need to add custlink again)
                if (n.children) {
                    n.children.forEach(b =>{
                        // console.log('the crude custlink ===')
                        // console.log(d)
                        // console.log('n.child ====')
                        // console.log(b)
                       if (b.data.idx === d.data.idx ){
                            d_ChildOf_n = 1;
                            // console.log(b.data.idx)
                            // console.log(d.data.idx)
                       }  
                    })
                }
                //also, if the custlink is the parent of the current node (n), do not do not make custlink (if the source/target of a custlink are indeed parent-child, a default link has been added by MakeChangeTree, no need to add custlink again)
                if (n.parent && d.data.idx === n.parent.data.idx){
                    d_ChildOf_n = 1;
                }
            }
            

            

            if (d_ChildOf_n===0) {
                // get the x y property
                d.parent.x = n.x, d.parent.y = n.y;
                // add the crude custlink to validcustlinks
                validcustlinks.push(d);
            }

        })
    })


    // console.log('validcustlins ======')
    // console.log(validcustlinks)

    // join (custlink data to empty path elements) 
    // think about putting all class names in the init.class. That way, the class name change can be done in one place
    var custlink = thetreeG.selectAll("path.custlinks")
        .data(validcustlinks, function(d) { return d.whatever; }); //v4 the return value is not used, so return whatever

    // console.log('custlink ===')
    // console.log(custlink)


    // enter (add path elements according to joined custlink)
    var custlinkEnter = custlink.enter().insert('path', "g") //v4
        .attr("class", "custlinks")
        .attr("stroke-opacity", 1e-6)
        .attr("d", function(d) {
            // console.log(d)// d contains elements of the data binding to the path
            var o = {x: parentdatapoint.x0, y: parentdatapoint.y0}; // this is different here from building links
            // var o = {x: d.parent.x, y: d.parent.y}; // for each path, let the link start from the parent's x, y
            return diagonal(o,o); //v4 // initially, let the s (source) and d(destination) coordinates of the path be the same: x0, y0 of the parentdatapoint
        });
    // console.log('custlinkEnter ===')
    // console.log(custlinkEnter)

    /* update (change waypoints of the path, 
        i.e., recalculating the path waypoints at any time during the transition) */
    var custlinkUpdate = custlinkEnter.merge(custlink); //d3v4
    // console.log(custlinkUpdate)

    custlinkUpdate.transition()
        .duration(showhidedescendants_duration)
        .attr("stroke-opacity", 1)
        .attr('d', function(d){ return diagonal(d.parent, d)}); 
        // attr('d', ..) is the final path after transition, it is from x,y coordinate of the parentnode to x,y of the current node


    // exit, make transition by changing the path waypoints towards the parent node, and eventually remove the path lines
    custlink.exit().transition()
        .duration(showhidedescendants_duration)
        .attr("stroke-opacity", 1e-6)
        .attr("d", function(d) {
            var o = {x: parentdatapoint.x, y: parentdatapoint.y};
            return diagonal(o, o); // v4 it is the final path after transition: all waypionts are at the x,y of the parentdatapoint	
        })
        .remove();

} // end custlink()


/**This is from the zooming part F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box*/
function zoomed() {
    svg.attr("transform", d3.event.transform);

	//this part is useless
    // this is intended to start the zoom at center where the current node is 
    // var transform = d3.event.transform,
    //     point = transform.invert(center_tree);
    //     console.log("point",point, "focus", focus)
    // transform = transform.translate(point[0] - focus[0], point[1] - focus[1]);
    // svg.attr("transform", transform);

}


/**the function to select a node, zoom in/out it, and put it in the center */
  //ZoomInOutSelectedNode: zoom in out the selected note
  function ZoomInOutSelectedNode(d){
    //disable the default right click menu
    d3.event.preventDefault(); 

    // need to stop listening to mousemove (which is trigger by pantree )
    d3.select(window).on('mousemove', null) //!!! must have, otherwise the dragtree will hava error
    //event.stopPropagation(); does not work

    //5.1.1 initialzie the vars for x, y coordinates, and the zoom levels
    var x; //x coordinate (horizontal) of the center of the selected path/shape to the left wall of the map g
    var y; // y coordinate (vertical)
    var xy_pathcenter; // an object containing data about the selected path/shape, including its x and y
    var translateStr; // a string to specify the travelling (i.e. translating) settings

    //5.1.2 determine the toggling settings (i.e., zoom in, select a new county, or zoom out)
    if (d && centeredNode !== d) {
        //a. if a different county is selected
        
        //5.1.2.a.1 get the center of the selected shape/path
		// var xy_pathcenter = path.centroid(d);
		// console.log(d)
        y = d.x; //xy_pathcenter[0];
        x = d.y; //xy_pathcenter[1];

        //5.1.2.a.2 determine the string for zooming (scale)
        // the syntax is like 'scale(10)'
        zoomLevel = zoomSettings.zoomLevel;

        //5.1.2.a.3 update the centeredNode, i.e., let it be the currentl selected node
        centeredNode = d

    } else {
        //b. if the selection (click) is not on a new node (i.e., the same node, or a none-node area is clicked )
        // 5.1.2.b.1 set the x, y value as the center of the window
        ///**modified part 9, the following is different, */
        // console.log(width_treeviewbox)
        x = width_treeviewbox / 2 - TreeMarginToSvg.left; //width1 / 2 ;
        y = height_treeviewbox / 2 - offsetshiftup  ; // height2 /2;

        // 5.1.2.b.2 set the zoom level =1 (zoom out)
        zoomLevel = 1;

        // 5.1.2.b.3 nulify the var centeredNode 
        centeredNode = null;

    }

    //5.1.3 determine the string for travel (translate)
    // the syntax is like 'translate (221, 176)'
    var translate_mapUpperLeft='translate (' + width_treeviewbox/2 + ',' + height_treeviewbox/2 + ')'

    //5.1.4 determine the string for enlarge/shrink (scale)
    var scaleStr = 'scale (' + zoomLevel + ')'

    //5.1.5 determine the offset 
    var translate_offsetSelectedPath='translate (' + -x  + ',' + -y + ')'

    //5.1.6 putting travelling and zooming together (translate and scale together)
    // the syntax is like translate (221, 176)scale(10)
    translateStr = translate_mapUpperLeft + scaleStr + translate_offsetSelectedPath

    //5.1.7 travel + zooming (i.e, translate + scale)
    thetreeG.transition()
        .duration(zoomSettings.duration)
        .ease(zoomSettings.ease) 
        .attr('transform', translateStr)
    ;

    
  }


/**given a flatterned data points with sorted row and col info, determine the maxRow and maxCol */
// console.log(flatterneddatapoints_sortedrowscols)
function getmaxrowscols (flatterneddatapoints_sortedrowscols) {
    var maxRows=0, maxCols=0, result=[];
    flatterneddatapoints_sortedrowscols.forEach(function(d, i){ 
        maxRows=Math.max(maxRows, d.sortedrow);
        maxCols=Math.max(maxCols, d.sortedcol);
    });
    // console.log(maxRows)
    result.push(maxRows);
    result.push(maxCols);
    return result;
}


/**For a given element, find its transform values
 * https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4/38230545#38230545
 * the transform values are saved at:
 * .transform.baseVal[0].matrix, or .transform.baseVal.consolidate().matrix
 */
function getTransformValues (theEle) {
    var theTransformValues = theEle.transform.baseVal.consolidate().matrix;
    return theTransformValues;
}



/**Another bug of d3 tree
 * When using tree().nodeSize, the tree group element is moved upwards and it goes out of the svg!
 * This problem is not solved in v4 and v5 (see example of 100a2)
 * 
 * Analysis:
 * The problem is because of the wrong shift up of nodes by transform.translate
 *  the d3 tree.NodeSize() method is to, start from the middle, translate nodes above the middle upwards,
 *      and the nodes below the middle downwards. 
 *      In the case of treedata, the three grandson nodes are translated upwards, the three granddaughter nodes downwards.
 *      It is for for the downwards, but the upward translation causes the tree g element (containing all nodes) expand upwards, which
 *          screws up its position. Come on!
 * To offset, the tree g element must be translated down. The distance to translate down equals to 1) the distance
 *  being shifted up of a node in the first row; 2) plus the margin to top from the tree g element to the parent svg.
 *      In this example using treedata.json, the node in the first row is 'Grandson1'. 
 *      The vertical node distance in nodeSize() is set at 65, the margin
 *          of tree g element to the top of svg is set at 20 (see init.js).
 *      Under such settings:
 *      1) when using fixed tree size method [i.e., d3.tree().size()], the result vertical coordinate
 *          (i.e., d.x) of the node 'Granson1' is 45;
 *      2) when using non-fixed tree size method [i,e., d3.tree().nodeSize()], the result vertical coordinate
 *          of the node 'Grandson1' is -195.
 *      As such, the distance to offset = 45 - (-195) + 20 (note, 20 is the TreeMarginToSvg.top)  = 260
 *      
 *      This is a clumsy method which draw the tree map for two times! but it works. Afterall, d3.nodeSize()
 *          sucks, and should be avoided. 
 * ************************************************************************/

 /** Get the offset distance to adjust the error caused by d3.tree().nodeSize()*/
    // 1) use tree.size() method to make a tree of fixed size

    function newtree_offsetNodeSizeMethodShiftError(){

        treeinstance = d3.tree().size([height_tree, width_tree]);
        var results=MakeChangeTree(rootdatapoint_sortedrowscols);
        //? need to run the custlink? maybe not
        noshift = d3.min(results.vcoords)
    
        // 2) use tree nodeSize() method to make a tree of automatically defined size
        treeinstance = d3.tree().nodeSize([between_nodes_vertical, between_nodes_horizontal]);//d3v4
        var results=MakeChangeTree(rootdatapoint_sortedrowscols);
        //? need to run the custlink? maybe not
        var shiftup = d3.min(results.vcoords)
        // console.log(noshift, shiftup)
        var offsetshiftup = noshift-shiftup + TreeMarginToSvg.top
        var offsetNodeSizeMethodShiftTranslateStr = 'translate('+ TreeMarginToSvg.left + ', '+ offsetshiftup +')';
    
        thetreeG.transition().duration(3500).attr('transform', offsetNodeSizeMethodShiftTranslateStr );
    
        return {'offsetshiftup': offsetshiftup} // for use in the translation adjustment in zooming (see components.ZoomInOutSelectedNode)
    
    }



// return the mouse key as str (right/left button, with shiftKey, altKey, ctrlKey, or any combination)
    //https://stackoverflow.com/questions/12518741/determine-if-shift-key-is-pressed-during-mousedown-event
function getmousekey(){

    /** the following part is of the first attemp. It is replaced with a better alternative method below */
    // if (d3.event.shiftKey && d3.event.ctrlKey) {
    //     showtext='ctrl-shift-mousedown'
    // } else if (d3.event.shiftKey){
    //     showtext='shift mousedown'
    // } else if (d3.event.ctrlKey) {
    //     showtext='ctrl-mousedown'
    // } else if (d3.event.altKey) {
    //     showtext='alt-mousedown'
    // } else {
    //     showtext='mousedown'
    // }
    // // right or left mouse down
    // // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    // // console.log(d3.event)
    // if (d3.event.buttons === 1 ){
    //     // note that a value of 0 is indeed the primary key (usually set as the left mouse click but for people using their left hand, it might be set as right mouse click )
    //     mousebutton = ' primary-click (left-click)'
    // } else if (d3.event.buttons === 2 ) {
    //     mousebutton = ' secondary-click (right-click)'
    // }
    // showtext=showtext + mousebutton;

    // the alternative and better method:
    var mousebutton='-unknown', shift='', alt='', ctrl='';
    if (d3.event.buttons === 1 ){
        // note that a value of 0 is indeed the primary key (usually set as the left mouse click but for people using their left hand, it might be set as right mouse click )
        mousebutton = '-primary(left)'
    } else if (d3.event.buttons === 2 ) {
        mousebutton = '-secondary(right)'
    }
    if (d3.event.ctrlKey) {
        shift = '-ctrl'
    }
    if (d3.event.shiftKey) {
        ctrl = '-shift'
    }
    if (d3.event.altKey) {
        alt = '-alt'
    }
    mousekey = ctrl + shift + alt + mousebutton;
    // remove the heading ('-')
    result=mousekey.slice(1) // substr from position 1 to end
    return result;
}



// when the mouse is pressed down, the following actions will be triggled
// drag and drop function works when a mousedown is detected for a g.nodeGs element, which is set in components.MakeChangeTree()    
function dragdrop () {

    event.stopPropagation(); // the mousedown is also listened by the treeG (for dragging the map) This line prevents

    var mousedown=1; // to indicate that mousedown status = 1 (this is for debug purpose)
    // console.log('1. mousedown= ' + mousedown)

    /**to improve
     * 1. when the same parent node is selected, move it to the back (such to allow sorting)
     * 2. radar circle is not a smart idea, as it is glichy.
     * 3. suppress the right mouse down ..
     * 3. if it is ctrl shift down, copy the node and its descendants
     */
    //

    //Note, 'd', 'this', 'd3.select(this)' are different
    // console.log(d) // note: 'd' is the data point
    // console.log(this) // 'this' the DOM Element (e.g. <g>...</g>)
    // console.log(d3.select(this)) //'d3.select(this)' the d3 object, from which one can select the objects of its descendants
    //get the selected object, get the data point of the selected, this is the SELECTED.
    var theSelectedObj=d3.select(this);

    // determine the mouse event (right/left click, with shiftKey, altKey, ctrlKey, or any combination)
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    
    // for fun!
    showtext= getmousekey() // this is to get a string which indicates what mouse button and shift/ctrl/alter keys are pressed
    d3.selectAll('g.pseudonodeGs').remove() // remove the previously created psuedonodeGs, otherwise there'll be more and more such psuedonodeGs
  
    // create a pseudo g group, containing a circle, and a text box
    pseudoNodeG = svg.append('g').attr('class', 'pseudonodeGs').attr('transform', 'translate (' + ((between_nodes_horizontal-20)/2 ) + ',0) '); // transform to make the text label visible
    pseudoNodeCircle = pseudoNodeG.append('circle').attr('class', 'pseudonodecircles');
    // var pseudoNodeText = pseudoNodeG.append('text').attr('class', 'pseudonodetext').attr('dy', '20').text(showtext);
    pseudoNodeText = pseudoNodeG
        .append('g')
        .attr('class', 'nodetextGs')
        .attr('transform', 'translate (' + (-(between_nodes_horizontal-20)/2 ) + ', '+ pseudonodetext_offsetdown + ')') // to move the text g box back (under nodes and centered)
        .append('foreignObject').attr('width', between_nodes_horizontal-20).attr('height', between_nodes_vertical-5)
        .append('xhtml:div')
        .attr('class', 'pseudonodetext')
        .text(showtext) 


    var mouseoverObj;     // will be used for both mouse over and out

    // detect mouse move
    d3.select(window)
    .on("mousemove", mousemove_dragdrop)
    .on("mouseup", mouseup_dragdrop);

    function mousemove_dragdrop () {
        var mousemove= 1;
        // console.log( '2. mousedown & move = ' + mousedown + ',' + mousemove)
        d3.event.preventDefault();// prevent the default text dragging

        // make the selected g and its components dimmed
        // ideally once the mouse move is detected, it is better to make the selected node and its descendants invisible. 
        // But, it is not a must to do!

        // show circle and text in the pseudonodeG with the same property as of the selected g group obj (same node, same text label, sam colors, etc)
        var theSelectedCircleObj = theSelectedObj.select('circle.nodecircles');
        pseudoNodeCircle
            .attr("r", theSelectedCircleObj.attr("r"))
            .attr('stroke-width',theSelectedCircleObj.attr("stroke-width"))
            .attr('stroke',theSelectedCircleObj.attr("stroke"))
            .style('fill',theSelectedCircleObj.style("fill"))
            .attr('stroke', 'lightgrey')
            .style("fill-opacity", 0.5)
        ;

        var theSelectedTextObj = theSelectedObj.select('div.nodetext');
        // ** originally set text elements
        // pseudoNodeText
        //     .text(theSelectedTextObj.text())
        //     .style("fill-opacity", 0.5)
        //     .style('font-size', theSelectedTextObj.style('font-size'))
        //     .attr("x", theSelectedTextObj.attr("x"))
        //     .attr("dy", theSelectedTextObj.attr("dy"))
        //     .attr("text-anchor", theSelectedTextObj.attr("text-anchor"))
        //     .style('font', theSelectedTextObj.style("font") )
        // ;
        // ** now set text format in a div 
        pseudoNodeText
            .text(theSelectedTextObj.text())
            .style("opacity", 0.5)
            .style('font-size', theSelectedTextObj.style('font-size'))
            .style('font-family', theSelectedTextObj.style("font-family"))
            .style('line-height', theSelectedTextObj.style("line-height"))
            .style('text-align', theSelectedTextObj.style("text-align"))
        ;

        // when mouse move, let the pseudo g move with the mouse, get the coordinates relative to the tree rect
        var tmpxyarray=d3.mouse(thetreerect.node());

        //calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
        var
        mousecurrentxy = {"toLeft": parseInt(tmpxyarray[0]), "toTop": parseInt(tmpxyarray[1])},
        mousexystr="(" + (mousecurrentxy.toLeft + 20) + ',' + (mousecurrentxy.toTop + 20)  + ')', // that 20 makes the pseudo circle and text 20 px down and right to the mouse cursor, so that the mouseover won't be interferered
        translatestr='translate ' + mousexystr;
    
        // let the pseudo node group fly to the point where the mouse is pressed down, show the pseudo group 
        pseudoNodeG.transition().duration(10)
        .attr('transform', translatestr);
        

        /**check if mouse is over a g group, and only over ONE g group
             * If the tree size is too small, there could be two nodes overlapping. 
             * In that case, mouse the mouse up and down until mouse is only above one group
             * I do not like the 'radar' shadow idea. it is ugly
             * */

        d3.selectAll('g.nodeGs')    
            .attr('pointer-events', 'mouseover') //? is this line a must???
            .on("mouseover", function(d){
                // console.log('3. mousedown move = ' + mousedown + ',' + mousemove + ' over the node: ' + d.data.name)
                mouseoverObj = d3.select(this)
                mouseoverObj.select('circle.nodecircles').style('fill', nodecircle_fill_dragover_color);
            })
            .on("mouseout", function(d){
                // d3.select(this).select('circle.nodecircles').style('fill',nodecircle_fill_showdescendants_color) // not correct, fill color could be different depending on whether there are descendants hidden
                d3.select(this).select('circle.nodecircles').style('fill',function(d) { 
                    return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color; 
                }); // !!! must check whether the descendants are hidden so as to determine the fill color
                // d3.selectAll('g.nodeGs').on("mouseover", null) // !!! will interfere with node overlap color change
                // mouseoverObj.node().removeAttribute('mouseover') // does not work
                mouseoverObj = null;
            })
        ;

        // on the other hand, upfront, prepare a bigger 'radar' circle (e.g., radius = 60) for each nodeGs, make it invisible
        //Well, I would say that this is not necessary. 

        // the following is not necessary
        // when mouse move over a g circle, calculate the distance between the mouse point, and the center of the radar circle
        // there might be multi radar circles that the mouse is over, in that case, determine the radar circle which has
            // the closest distance to the mouse point
        // assum that radar circle is the target, draw a line between the it and the mouse point
        // End of the unnecessary part

    }

    // on mouse up, do the following
    function mouseup_dragdrop () {          
        var mousemove=0, mousedown=0; // these are for debug purpose

        // remember theParentToChangeObj
        theParentToChangeObj = mouseoverObj;
        // console.log('mouseoverObj==========')
        // console.log(mouseoverObj)
        // console.log('theParentToChangeObj==========')
        // console.log(theParentToChangeObj)


        // console.log('theSelectedObj==========')
        // console.log(theSelectedObj)
        // console.log(theNewParent)

        // if theParentToChangeObj is null, do nothing
        /**else:
         * 1) add theSelectedObj as the last child to theParentToChangeObj
         * 2) find parent original parent of theSelectedObj, and delete theSelectedObj from the original parent
         * 3) run MakeChangeTree()
         */
        if (theParentToChangeObj !== null && theParentToChangeObj != undefined){
            
            //1) add theSelectedObj as the last child to theParentToChangeObj
            // console.log('theParentToChangeObj===========')
            // console.log(theParentToChangeObj)
            theParentToChangeObj.attr('new_attr', '');
            theParentToChangeObj.attr("new_attr", function(d){
                /** this is the way to get data binded to theParentToChangeObj, the purpose here has nothing to do with
                 * the class attribute. The class attr is used to call back the binded data (d) 
                */
                
                // console.log('theroot data ===')
                // console.log(rootdatapoint)
                // console.log('theparenttochange obj data ====')
                // console.log(d)
                //  console.log(d.children.length)
                /**
                 * be careful, only d.data.children are original data
                 * d.children is created by d3.tree
                 * add the data binded to the selected obj as the last child of d.data.children
                 * 
                 * Note: the adding process is quite twisting
                 */
                //0. get theSelectedObjData

                //1. define d.children
                var theParentToChangeData = d;



                // 2. use the same trick to find data binded to the selected obj
                // console.log('theSelectedObj==========')
                // console.log(theSelectedObj)
                theSelectedObj.attr('new_attr', '');
                theSelectedObj.attr("new_attr", function(d){
                    // console.log('the selected obj data ===')
                    // console.log(d)

                    var theSelectedObjData=d;

                    // !!! must have. recursively find theSelectedObjData 's ascendants do not make changes
                    // if theParentToChangeData is in the ascendants stop make changes
                    var ascendants=[];
                    function getAscendants(d){
                        // console.log("d.parent===")
                        // console.log(d.parent)
                        if (d.parent !== undefined && d.parent !== null){
                            ascendants.push(d.parent)
                            getAscendants(d.parent)
                        }
                    }
                    // console.log('ascendants ====')
                    // console.log(ascendants)
                    getAscendants(theParentToChangeData);
                    var stopchangingparent =0;
                    //if dragging to the node itself, do not make changes
                    if (theParentToChangeData === theSelectedObjData) {
                        stopchangingparent =1
                    }
                    if (ascendants.includes(theSelectedObjData)) {
                        stopchangingparent=1;
                    }
                    // console.log('stopchaningparent ====')
                    // console.log(stopchangingparent)

                    if (stopchangingparent != 1){

                        // console.log ('make changes ====')

                        //!!! must have. change theParentToChangeData._children to children
                        if (theParentToChangeData._children) {
                            theParentToChangeData.children = theParentToChangeData._children;
                            theParentToChangeData._children = null;
                        }

                        // add the selected obj data as the last child of theParentToChangeData
                        //!!! must have
                        if (theParentToChangeData.children===undefined || theParentToChangeData.children === null ){
                            theParentToChangeData.children=[]
                        }
                        theParentToChangeData.children.push(theSelectedObjData) //simply push it to the end of the children array
                        // console.log('theParentToChangeData===')
                        // console.log(theParentToChangeData)

                        //!!! must have
                        if (theParentToChangeData.data.children === undefined || theParentToChangeData.data.children === null){
                            theParentToChangeData.data.children=[]
                        }
                        // add the selected obj data.data (this is the original data) to theParentToChangeData.data.chilren
                        theParentToChangeData.data.children.push(theSelectedObjData.data)

                        // find the original parent of the selected obj data
                        originalParentData = theSelectedObjData.parent
                        // console.log('originalParentData=================')
                        // console.log(originalParentData)

                        // change the .parent property of theSelectedObjdata, change to theParentToChangeData.data
                        theSelectedObjData.parent =theParentToChangeData; 

                        // !!! must change change depth = theParentToChangeData.depth +1
                        theSelectedObjData.depth = theParentToChangeData.depth +1

                        //!!! must have! for all shown descendants of the selected obj data, update the depth
                        function getdescendants_shownchildren(a) {
                            if (a.children !== null && a.children !== undefined ){
                                a.children.forEach(function (v){
                                    // children's depth = parent.depth +1
                                    v.depth = a.depth + 1;
                                    getdescendants_shownchildren(v)
                                })
                            }
                        }
                        getdescendants_shownchildren(d);

                        //!!! must have! for all hidden descendants of the selected obj data, update the depth
                        function getdescendants_hiddenchildren(a) {
                            if (a._children !== null && a._children !== undefined ){
                                a._children.forEach(function (v){
                                    // children's depth = parent.depth +1
                                    v.depth = a.depth + 1;
                                    getdescendants_hiddenchildren(v)
                                })
                            }
                        }
                        getdescendants_hiddenchildren(d);


                        // within originalParentData's children find the one which equals to the selected obj data, and remove it from the children array
                        for (i=0; i < originalParentData.children.length;i++ ){
                            if (originalParentData.children[i] === theSelectedObjData){
                                originalParentData.children.splice(i, 1);
                                break;
                            }
                        }
                        for (i=0;i<originalParentData.data.children.length;i++ ){
                            if (originalParentData.data.children[i] === theSelectedObjData.data){
                                originalParentData.data.children.splice(i, 1);
                                break;
                            }
                        }
                        // must have!!! if originalParentData.children =[] make it null. (d3 tree goes wrong if .children =[])
                        if (originalParentData.children.length === 0){
                            originalParentData.children=null;
                        }
                        // console.log('originalParentData.children=====')
                        // console.log(originalParentData.children)
                        
                        // !!! must have! let  x0 y0 of the selected data = that of the parent data
                        // Well, doesn't matter

                        // theSelectedObjData.x = theParentToChangeData.x;
                        // theSelectedObjData.y = theParentToChangeData.y;

                        // console.log('after all changes ========')

                        // console.log('theParentToChangeObj==')
                        // console.log(theParentToChangeObj)
                        // console.log(theParentToChangeObj.node())
                        // // console.log('treeJSON============')
                        // // console.log(treeJSON)
                        // console.log('rootdatapoint_sortedrowscols=========')
                        // console.log(rootdatapoint_sortedrowscols)

                        // theParentToChangeObj.node().remove() // no need
                        //theSelectedObj.node().remove()
                        // MakeChangeTree(theSelectedObjData)
                        // MakeChangeTree(originalParentData)
                        //MakeChangeTree(theParentToChangeData)
                         var updateTree= MakeChangeTree(rootdatapoint_sortedrowscols) 
                         custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate )
                    }
                })

            })
        }


        // stop mouseover actions
        d3.selectAll('g.nodeGs').on("mouseover", null)

        //1) add (append) the SELECTED as the last children of the data point corresponding to the g group containing that radar circle
        //2) get the parent data point of the SELECTED
        //3) delete the SELECTED children/_children        
        
        // cancel listening to mousemove/mouseup (in fact, it is to DO NOTHING as mouse moves or released)
        d3.select(window).on("mousemove", null).on("mouseup", null);
        // let the text group return to the up left corner.
        pseudoNodeG.transition().duration(10)
        .attr('transform', 'translate(0,0)');
        // hide the pseudo circle
        pseudoNodeCircle.attr('r', 1e-6)
        // hide the text box 
        pseudoNodeText.text('').style("opacity", 1e-6)
    }

} // end drag drop



// to pan the tree (press mouse button down, hold and move the tree diagram within the svg box)
function pan () {

    // listen to mousedown and mouseup actions
    d3.select(window)
        .on('mousedown', mousedown_pan)
        .on('mouseup', mouseup_pan)

    function mousedown_pan() {

        d3.event.preventDefault(); //!!! must have! to avoid text dragging 
        
        //1. determine whether the mousedown is within the treerect area
        /**    the clicked is the window DOM, but how to know if the click is within the treeview box?   */

        /**One way to get the size and coordinates of treeviewbox to its parent (body), then compare the mouse position to the body... */
        // treeviewbox_leftup = treeviewbox.node().getBoundingClientRect(); 

        /**However, an easier way is to compare the mouse position relative to the treerect. 
         * If the mouse point is in the treeviewbox, the coordinates should be between 0 and width/height of the treerect
         */

        // svg.attr('width',width_treeviewbox-5).attr('height',height_treeviewbox-50)
        var width_selectedtreerect=Number(thetreerect.attr('width'))
        var height_selectedtreerect=Number(thetreerect.attr('height'))
        var mouseHV_treerect= d3.mouse(thetreerect.node());

        
        if ( 0 <= mouseHV_treerect[0] && mouseHV_treerect[0] <= width_selectedtreerect
            && 0 <= mouseHV_treerect[1] && mouseHV_treerect[1] <= height_selectedtreerect  ) {

            //2. show current mouse position relative to the tree rect

            //2.1 calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
            var mouseToTreeRect = {"toLeft": parseInt(mouseHV_treerect[0]), "toTop": parseInt(mouseHV_treerect[1])},
                mousexystr="(" + mouseToTreeRect.toLeft + ',' + mouseToTreeRect.toTop  + ')'; 
            
            //2.2 show mouse to rect coordinates on the upleft corner of the svg
            //must have!!!
            d3.selectAll('g.pseudonodeGs').remove() // remove the previously created psuedonodeGs, otherwise there'll be more and more such psuedonodeGs
            
            //2.3 create a pseudo g group, containing a text box
            pseudoNodeG = svg.append('g').attr('class', 'pseudonodeGs') 
            pseudoNodeText = pseudoNodeG.append('text').text(mousexystr).attr('dy', '1em')

            //2.4 get the mouse coordinates to treeG
            mouse_theTreeG = d3.mouse(thetreeG.node()) // Note: must get it before mouse moving
            // console.log('mouse to g box')
            // console.log(mouse_theTreeG)
            
            // 3. when  mouse is down and moving
            d3.select(window)
                .on('mousemove', function(){                    

                    // 3.1 get the mouse coordinates to the treerect (as mouse is moving)
                    var tmpxyarray=d3.mouse(thetreerect.node());
                    var mouseToTreeRect = {"toLeft": parseInt(tmpxyarray[0]), "toTop": parseInt(tmpxyarray[1])},
                        mousexystr="(" + mouseToTreeRect.toLeft + ',' + mouseToTreeRect.toTop  + ')'; 

                    //get the mouse coordinates about the treeG element
                    // Wrong! as mouse and treeG are both moving, it causes error here when trying to get mouse to treeG coordinate
                    // mouse_theTreeG = d3.mouse(thetreeG.node())
                    // console.log('mouse to g box')
                    // console.log(mouse_theTreeG)
                    
                    //3.2 prepare translation string (for moving the treeG)
                    var thetreeGtranslateHV="(" + (mouseToTreeRect.toLeft - mouse_theTreeG[0]) + ',' 
                        + (mouseToTreeRect.toTop -mouse_theTreeG[1])  + ')';
                    var translatestr='translate ' + thetreeGtranslateHV;
                    //3.3 show mouse position in pseudoNodeText
                    pseudoNodeText.text(mousexystr).style("opacity", 1)
                    
                    //3.4 Must have!!! so as to enable pan when zoom in
                    var scaleStr = 'scale (' + zoomLevel + ')'
                    
                    //3.5 let the treeG moves with the mouse move
                    thetreeG.transition().duration(0)
                        .attr('transform', translatestr+scaleStr);
                    
                    //3.6 must have!!! when mouse up, callback 'mouseup_pan
                    d3.select(window).on('mouseup', mouseup_pan)

                })

        } else {
            // console.log('mouse point is NOT in the tree rect!')
        }
    }

    function mouseup_pan(){
        d3.select(window).on('mousemove', null)
        d3.selectAll('g.pseudonodeGs').remove()
        // console.log('mouse is up')
    }

} // end function pan ()






/**The following are coped from  F:\Personal\Dropbox\Project\JavaScript Graphic Editor\Testing pages\js\d3try89.js
 * **************************************************************************************************************
 * **************************************************************************************************************
 * **************************************************************************************************************
*/
  /**giveen a flatterned data point array, determine the proper row and col for each point on a map */
function getSortedRowsCols(thisDataArray){
    /*determine the row and col number for each data element*/
    var cols1=[], rows1=[], n_cols=0, n_rows=0;
    thisDataArray.forEach(
        function(d){					
            //define the cols1
            //if n_cols has not been defined
            if (n_cols=0){
                var n_cols=1;
                cols1[0]=d.depth; // let the current element be the value of d.depth
            } else{
                //if n_cols has been defined
                //check if the d.depth can be found in the array cols1
                if (cols1.includes(d.depth) === true){
                    //do nothing
                }else {
                    //if the current d.depth is a new value, push it into the end of the array
                    cols1.push(d.depth)
                }						
            }
            //save the col number to the current d1
            d.col1=cols1.indexOf(d.depth)	;
            
            //define the rows1
            //if n_rows has not been defined
            if (n_rows===0){
                var n_rows=1;
                rows1[0]=d.x; // let the current element be the value of d.x
            } else{
                //if n_rows has been defined
                //check if the d.depth can be found in the array rows1
                if (rows1.includes(d.x) === true){
                    //do nothing
                }else {
                    //if the current d.x is a new value, push it into the end of the array
                    rows1.push(d.x)
                }						
            }
            //save the col number to the current d1
            d.row1=rows1.indexOf(d.x);					
        }
    );
    //now, the array cols1 and rows1 contains distinct rows and cols, and d.y/d.x values of the data elements
    //but the values in these arrays are not sorted, next is to sort the array, while keeping the original index number
    var cols2=[], rows2=[];
    cols1.forEach(
        function(d, i){
        cols2[i]={value:d, oldindex:i};
        }
    );
    rows1.forEach(
        function(d,i){
            rows2[i]={value:d, oldindex:i};
        }
        

    );
    //console.log(cols1)			
    var cols3=cols2.sort(function(a,b){
        return a.value-b.value;
    })
    //console.log(cols3)
    //console.log(rows1)	
    var rows3=rows2.sort(function(a, b){
        return a.value-b.value;
    })
    //console.log(rows3)
        
    //put the sorted oldindex into arrays	
    var sortedColOldindex=[];
    cols3.forEach( function(d, i){
        sortedColOldindex[i] = d.oldindex;
    } );
    //console.log(sortedColOldindex);
    var sortedRowOldindex=[];
    rows3.forEach( function(d, i){
        sortedRowOldindex[i] = d.oldindex;
    } );
    //console.log(sortedRowOldindex);

    /*next, in each data element, find the col1 and row1, which are corresponding to the oldindex in sortedColOldindex/sortedRowIndex
    e.g., sortedRowIndex[1] =0. in the data element, the current d.row1 = 0
    in this case, sortedRowIndex[1]= d.row1, as the oldindex and row1 are matched, we'll save d.sortedrow=index of row3, which is 1
    to do so, we'll
        1) search the indexOf the value 'd.row1' in the array sortedRowIndex
        2) save the found index number into d.sortedrow
    */
    thisDataArray.forEach(function(d){
    d.sortedrow = sortedRowOldindex.indexOf(d.row1);
    d.sortedcol=sortedColOldindex.indexOf(d.col1);
    delete d.row1;delete d.col1;
    });

    return thisDataArray;
}	//end of function


