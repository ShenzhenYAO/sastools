// add title and descriptions
function addtitledesc (){
    var titlediv=d3body.append('div').attr('class', 'titlediv')
	// add the h2 title
	titlediv
	.append('p')
    .attr('class', 'pagehead')
    .styles({'font-size': '30px', 'font-weight': 'bold'})
    .text('D3 try ' + window.location.href )
    .append('span')
    .styles({'font-size': '12px', 'font-weight': 'normal'})
    .text('------ commit ' + gitcommitversion + ': ')
    .append('a')
    .attrs({'href': 'https://github.com/junkthem/simple_d3tree_v3tov4.io', 'target':'_blank' })
    .text('https://github.com/junkthem/simple_d3tree_v3tov4.io')
	;
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
            if not show it in console.log, the reload will not be fired (started)
        This problem because using sessionStorage. When using sessionStorage, such problem disappears
            */
		// console.log(sessionStorage.getItem("loadedjsonstr")) ////
		if (sessionStorage.getItem("loadedjsonstr") === null ){
            // document.location.reload();
            document_reload();
		}
	});
}

// load JOSN from URL, no need to use sessionStorage
function newTreebyJsonfromURL(url){
    d3.json(url, function(err, srcjson) {
        if (err) throw error;
        // create the tree data
        treeData=srcjson
        NewTree(treeData)
    })
}


/** get the loaded jsonstr from a sessionStorage item, parse the jsonstr to a JSON obj, and save it to treeJSON
 * Note:
 * 1. the following code lines are in a function, can be put into the separate file (components.js), such to keep 
    the modules.js neat.  
 * 2. the function is in IFFE (Immediately invoked function expression) style (https://en.wikipedia.org/wiki/Immediately_invoked_function_expression)
	IFFE style can return values without asynchronous issues.
 */

// const getJsonFromsessionStorage  = (function () {
// 	// 1. load json inot a sessionStorage item (loadedjsonstr)
// 	loadjson (treejsonURL); //Note: the loadjson() has to run within getJsonFromsessionStorage Otherwise the sessionStorage Item cannot properly work.
//     /* again the trick is to show the sessionStorage item in console.log. If not, the sessionStorage item will be null
//         and the page is not reloaded
//         This problem because using sessionStorage. When using sessionStorage, such problem disappears
//         */
//     // console.log(sessionStorage.getItem("loadedjsonstr")) ////
//     if (sessionStorage.getItem("loadedjsonstr") === null ){
//         // document.location.reload();
//         document_reload();
//     }
//     var loadedjsonstr = sessionStorage.getItem("loadedjsonstr");
//     // console.log(loadedjsonstr)
//     sessionStorage.removeItem("loadedjsonstr") // this line does not work
//     return JSON.parse(loadedjsonstr);
// })()

/** reload the page for one time (this is to fix the bug of firefox that'document.location.reload()' causes
 *  firefox to constantly reload the doc )
 */
function document_reload(){
    // console.log('to reload page')
    sessionStorage.setItem('pagereloaded', 'false')
    if (sessionStorage.setItem === 'false'){
        document.location.reload();
        sessionStorage.setItem('pagereloaded', 'true')
    }
}



// if the 'new diagram' button is clicked
function CreateNewGrandTree(){
	// console.log("refresh and run newGrandTree")
    //create a new treeJSon, assign idx
    treeData=[{idx:generateUUID(), name:"new"}]
    // make a new tree
    NewTree(treeData)
}

// randomly generate a non-repeating id
//https://bl.ocks.org/adamfeuer/042bfa0dde0059e2b288
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


/**JQuery to check DOM Element changes and take actions as specified*/
$(document).ready(function(){

    //load existing file
    $('#file_input').on('change', function(){

        //console.log(this.files) // 'this' refers the input DOM element, this.files are a list of files (e.g., multiple files are selected in the open file dialog box)
        var thefirstfileobj = this.files[0]; // the value of thefirstfile is a map with fields like 'name;, size, type, etc.
        // console.log('thefirstfileobj======')
        // console.log(thefirstfileobj)

        //get the extension name
        var ext =thefirstfileobj.name.substring(thefirstfileobj.name.lastIndexOf('.')+1)
        // console.log(ext)


        if (ext.toLowerCase() === 'egp') { // if the extension is egp, run import from egp
            ImportFromEGPAfterReloading(this);
        } else { // else run import from json
            // use the function readfile to read the first file, get the treeData, and use the treedata to make a new tree
            readlocalfile(thefirstfileobj, function(f) { // the 'funciton(f){...}' part is the call back function coresponding to the 'callback' in the function readfile()
                // console.log(f.target.result)
                treeData=JSON.parse(f.target.result)
                // create the tree data
                // console.log('treeData when file_input is ready ======')
                // console.log(treeData)
                NewTree(treeData)
                // treeData = null;
            });
        } // end if

        //empty the input elm. !!! must have. Otherwise cannot repeatedly load the same file 
        this.value = null

    });//end load existing file

    // // load egp
    // $('#egp_input').on('change', function(){
    //     ImportFromEGPAfterReloading(this);
    // }) // load egp
    
    // //load subtree;
    //         //load existing file
    // $('#sub_input').on('change', function(e){

    //     console.log(e)
    //     readFile(this.files[0], function(f) {
    //         //manipulate with result...
    //         //$('#output_field').text(e.target.result);
    //         //console.log(typeof(e.target.result))
    //         var theLoadedSubJSON=JSON.parse(f.target.result); //f.target.result must be like [{"thekey": "thevalue"}] (i.e., theKey must be quoted)
    //         //console.log(currentDataEle)
    //         //theTasksAndCrosslinks=theLoadedJSON[0]
    //         currentDataEle._subjson=theLoadedSubJSON;
    //         //close the modal;
    //         document.getElementById('ManageSubtreeModal').style.display="none";
    //         //the text won't be updated on screen, unless the node html ele is deleted, and updated.
    //         currentDataEle.theNodeG.remove();
    //         updateTree(currentDataEle)
    //     });

    // }); //end of load subtree
    
    
});//end of doc ready watch

//https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// read contents of a local file
function readlocalfile(thefileobj, callback_whendoneDosomething){ // the fileobj is a file system object, containing file name, size, path, etc.
    var newreaderinstance = new FileReader(); // create a new instance of FileReader() class
    newreaderinstance.readAsText(thefileobj); // use the method readAsText of the new instance to read the file
    newreaderinstance.onload = callback_whendoneDosomething; // when the loading is done, run the call back function defined in the readfile instance
}




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

    var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(d);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
}	

//estimate tree size
function estTreesize(therootdatapoint){
    /*B.1.2.0, have a tree instance with default size setting */
    var tmptreeinstance=d3.tree();    
    /*B.1.2.1, flatten the data points, putting them in an array */
    var flatterneddatapoints =tmptreeinstance(therootdatapoint).descendants(); // despite of the default tree()size setting, nodes in different rows yet have different d.x (e.g., 0.875, 0.75, etc. The diff is small but can be identified)
    // console.log('flatterneddatapoints ===')
    // console.log(flatterneddatapoints)

    /**B.1.2.2 for each datapoint, get the sorted row and col number  */
    flatterneddatapoints_sortedrowscols=getSortedRowsCols(flatterneddatapoints);

    /**B.1.2.3 get the maxrows and cols */
    var maxrowscols= getmaxrowscols(flatterneddatapoints_sortedrowscols)
    // console.log('maxrowscols ===')
    // console.log(maxrowscols)

    /**B.1.3 estimate the size of the tree
     * so, vertically the rows should be between_nodes_vertical apart from each other
     * horizontally, between_nodes_horizontal apart from each other
     * These parameters (between_nodes_vertical, ...) are defined in init.js
     * the width_tree should be (maxrows -1) * between_nodes_vertical plus padding (margin to top and bottom)
     * the height_tree should be (maxcols -1) * between_nodes_horizontal plus padding (margin to left and right)
     */

    // one can never get the right paddings with the stupid design of d3.tree
    var height_tree = maxrowscols[0] * between_nodes_vertical; // this will put rows with paddings of half the between_nodes_vertical top and bottom
    var width_tree = maxrowscols[1] * between_nodes_horizontal;

    return {'width': width_tree, 'height': height_tree}

} // end estTreesize()

// Collapse the node and all it's children. It is also new in d3v4
// recursively collapse all nodes
function collapse(d) {
    // console.log(d)
	if(d.children) {
        d._children = d.children
        d.children = null
		d._children.forEach(collapse)		
    }
}
function collapseAll(source){
    collapse(source)
     var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(source);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
    
    // if collapse to root, return the default view (simulate a right click on treerect)
    if (source.parent === null || source.parent === undefined) {
        //right click the rect to return to the deafult tree view
        // console.log(source)
        https://stackoverflow.com/questions/7914684/trigger-right-click-using-pure-javascript
        var element =thetreerect.node()
        if (window.CustomEvent) {
            element.dispatchEvent(new CustomEvent('contextmenu'));
        } else if (document.createEvent) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('contextmenu', true, false);
            element.dispatchEvent(ev);
        } else { // Internet Explorer
            element.fireEvent('oncontextmenu');
        }
    }
    
}




function expandAll(source){
	var theurl ="http://epicanada.x10host.com/sound/clickbutoon2.mp3";
	playclicksound(theurl);
    expand(source); 
    var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(source);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
}
function expand(d){   
    var children = (d.children)?d.children:d._children;
    if (d._children) {        
        d.children = d._children;
        d._children = null;       
    }
    if(d.children){ // recursively expand d.children
        d.children.forEach(c=>{
            expand(c)
        })
    }
}


function playclicksound(theURL){	
    /*var theurl ="http://epicanada.x10host.com/sound/clickbutoon2.mp3"*/
    var theAudio = new Audio(theURL);	
    theAudio.play();
}	

    



// create a new tree, add pan and custlinks
function NewTree(thetreedata){

    //B.0 console.log('show treeJSON =======')
    /**check if treeJSON is an Array ([..]). If so, change it to a JSON like obj ({...}) */
    if (Array.isArray(thetreedata)){
        treeJSON = thetreedata[0];
    } else {
        treeJSON = thetreedata;
    }
    // console.log(treeJSON)


    /**B. Add tree ************************************************/

    /*B.1. determine the proper size of svg to contain the tree map 
        One of the stupid things about d3 is that it cannot automatically expand the svg container of the tree map.
        Also, it cannot provide a simple way to return the tree size, or the size of the g element which contains tree nodes 
        It is rather the otherway around: user decide the tree size, and d3.tree() squeezes all nodes (no matter how many) into the tree diagram
        How dumb it is!

        So the size of a tree has to be estimated upfront according to # of nodes in rows and columns 
    */

    /**B.1.1 Get the rootdatapointdata point. Also for each data point calculate the default x and y coordinates
     * Note: rootdatapointis not only the rootdatapointitself. it also contains its descendants (i.e., children, grandchildren... etc).  
    */
    var rootdatapoint= d3.hierarchy(treeJSON, function(d) { return d.children; }); //v4 Note: it creates .depth and .height, but not .id
    // console.log(rootdatapoint)

    /**B.1.2 calculate the number of columns and rows based on the datapoints in rootdatapoint
     * https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
    */

    var proposedTreesize = estTreesize(rootdatapoint)
    // console.log('the estimated tree size ()')
    // console.log(proposedTreesize.width, proposedTreesize.height)


    // /**B.1.3 
    //  * Now how to make the flatterned back to hierarchical structure?
    //  * d3.stratify()..., or, 
    //  * Do not have to, as the first element is with its descendants, i.e., in hierarchical structure!
    // */
    rootdatapoint_sortedrowscols = flatterneddatapoints_sortedrowscols[0];

    /**B.1.4 add new properties (coordinates of the starting position) */
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2;
    rootdatapoint_sortedrowscols.y0 = 0; // this is only to do for once here when creating the tree for the first time. This line is not seen when updating the tree
    // rootdatapoint.x0= height_tree /2;;
    // rootdatapoint.y0=0;
    // console.log(rootdatapoint)
    // console.log(rootdatapoint_sortedrowscols)


    /**B.2 make a new tree */

    // according to the selected method, make a new tree
    if (newtreeMethod === 'bynodesize') {
        // use the newtree_offsetNodeSizeMethodShiftError to make new tree, make adjustment and get the offset distance for zooming ()
        var offsetshiftup = newtree_offsetNodeSizeMethodShiftError().offsetshiftup;
    } else {

        /**the following part is to test the default tree size,  */

        // treeinstance = d3.tree()
        /** the above is to use size() method without specifying the tree size
         * initially the treeG size is width: 160, height 254; 
         * after waiting for 3 seconds until the treeG is updated, the width is 520, height 70 
         * without specifying the size(), d3v4 uses the size() method (not the nodesize() method)
         * Both width and height are adjusted from the inital setting, but the adjustment for height is pretty wierd
         */    

        // treeinstance = d3.tree().separation(function(a, b) { return (a.parent == b.parent ? 1 : 2); })
        /** the above is to use size() method without specifying the tree size, but adding the separation settings (for adjusting distance between cousin nodes)
         * initially the treeG size is width: 160, height 254; 
         * after waiting for 3 seconds until the treeG is updated, the width is 520, height 70 
         * it seems that separation() does not work when using size() 
         */

        treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]); // don't put it inside MakeChangeTree, as the bynodessize () method requires a different line (.nodeSize() instead of .size())
        // do not use the newtree_offsetNodeSizeMethodShiftError(), create the tree directly, not to adjust (no need) offset errors as nodeSize() method is not used
        // initially the treeG size is width: 160, height 60; 
        /** the above is to use size() method WITH specified tree size
         * initially the treeG size is width: 160, height 60; (note that it is different from the height of 255 without size specification)
         *  The height of 60 comes out from: 1) the column with the highest number of nodes, i.e., column 3, has 6 nodes
         *      so the default height = 360 (the specified height) / 6 = 60 (what the freak is that logic! 
         *      Anyways, that is how d3 works out)
         * after waiting for 3 seconds until the treeG is updated, the width is 520, height 362
         * 
         * It seems that usng the size() method with specified size, 
         * 1) the width is determined by d3v4. d3v4 ignores the width specified by users
         * 2) the height is LARGELY determined by users' specification. Yet, d3v4 makes further adjustment 
         */
        
        updateTree = MakeChangeTree(rootdatapoint_sortedrowscols);
        // console.log('updateTree ==================')
        // console.log(updateTree)
        
    }
        
    /**C. Enable panning (press and hold mouse to move the tree within the svg/treerect)  */
    pan();

    /**D. add customized links */
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from

}// end function NewTree()




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
        })// right click to show the custlinkmenu (including delete)
        .on("contextmenu", d3.contextMenu(custlinkmenu))
        ;
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


function deletecustlink (thecustlinkElm){

    thecustlinkd3obj =d3.select(thecustlinkElm)

    var thecustlinkdata;
    thecustlinkd3obj.attr('fakeattr', d=>{
        thecustlinkdata =d;
    })

    // console.log(thecustlinkdata)
    // the idx of the target node of the thecustlinkdata
    // var thetgtidx = thecustlinkdata.idx
    var thesrcidx = thecustlinkdata.parent.data.idx
    if (thecustlinkdata.data.custparents !== null &&  thecustlinkdata.data.custparents !== undefined ){
        //loop to match thesrcidx to an idx in custparents
        var thecustparents = thecustlinkdata.data.custparents 
        thecustparents.forEach((d, i) =>{
            if (d.idx === thesrcidx){
                // delete the matched idx from the custparents
                thecustparents.splice(i,1) // use splice() only there is ONE matched item in the array
            }
        })
        // console.log(thecustlinkdata.data)
        // if thecustparents is empty, delete the field thecustparent
        if (thecustlinkdata.data.custparents.length ===0){
            delete thecustlinkdata.data.custparents
        }
        //The custparent of the target node in root data is also deleted:
        //console.log(updateTree)
    }
      //delete the custparent from the target node
    //remove the custlink path
    // console.log(thecustlinkd3obj.node())
    thecustlinkElm.remove()
} // end deletecustlink






/** **************************************about zooming ***************************** */



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
    
    // console.log('in zoom in out selected node ===============')

    var currentsvgw = svg.attr('width')
    var currentsvgh = svg.attr('height')

    //disable the default right click menu
    d3.event.preventDefault(); 

    // need to stop listening to mousemove (which is trigger by pantree )
    d3.select(window).on('mousemove', null) //!!! must have, otherwise the dragtree will hava error
    //event.stopPropagation(); does not work

    //5.1.1 initialzie the vars for x, y coordinates, and the zoom levels
    var x; //x coordinate (horizontal) of the center of the selected path/shape to the left wall of the map g
    var y; // y coordinate (vertical)
    // var xy_pathcenter; // an object containing data about the selected path/shape, including its x and y
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
        x = currentsvgw / 2 - TreeMarginToSvg.left; //width1 / 2 ;
        y = currentsvgh / 2 - offsetshiftup  ; // height2 /2;

        // 5.1.2.b.2 set the zoom level =1 (zoom out)
        zoomLevel = 1;

        // 5.1.2.b.3 nulify the var centeredNode 
        centeredNode = null;

    }

    //5.1.3 determine the string for travel (translate)
    // the syntax is like 'translate (221, 176)'
    var translate_mapUpperLeft='translate (' + currentsvgw/2 + ',' + currentsvgh/2 + ')'

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
    
} // end ZoomInOutSelectedNode()


/**given a flatterned data points with sorted row and col info, determine the maxRow and maxCol */
// console.log(flatterneddatapoints_sortedrowscols)
function getmaxrowscols (flatterneddatapoints_sortedrowscols) {
    var maxRows=0, maxCols=0, result=[];
    flatterneddatapoints_sortedrowscols.forEach(function(d, i){ 
        maxRows=Math.max(maxRows, d.sortedrow);
        maxCols=Math.max(maxCols, d.sortedcol);
    });
    // console.log(maxRows)
    result.push(maxRows+1); // the rows and cols start from 0, so if maxrows = 6, there are indeed 7 rows. Same for maxcols
    result.push(maxCols+1);
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
function dragdrop() {
    
    event.stopPropagation(); // the mousedown is also listened by the treeG (for dragging the map) This line prevents
    event.preventDefault();

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

    //add a pseudo cross link
    var theSrcXY = {'x':0, 'y':0}; //initialize the src xy obj
    //get the x, y of the sourceObj;
    theSelectedObj.attr('fakeattr', d=>{
        theSrcXY.x = d.x;
        theSrcXY.y = d.y;
    })
    // add a pseudo crosslink
    var thepseudolink = thetreeG.append('path')
        .attr('class', 'peudolinks')
        .attr('d', d=>{
            return diagonal(theSrcXY,theSrcXY);
        })
    

    // detect mouse move
    d3.select(window)
        .on("mousemove", mousemove_dragdrop)
        .on("mouseup", mouseup_dragdrop);

    //on mousemove, check the keys and do different tasks
    function mousemove_dragdrop(){
        // for left mouse button only, run drag and drop to change node parent
        if (getmousekey() === 'primary(left)'){
            mousemove_dragdrop_primary();
        } 
        if (getmousekey() === 'shift-primary(left)') {
            // console.log('shift-primary(left) pressed')
            mousemove_dragdrop_shiftprimary () ;
        }
    }

    //on mouseup, check the keys and do different tasks
    function mouseup_dragdrop(d){
        //when mouse is up, need to determine whether the mouse is over a node or not
        // note that the mouseup is not binded to any mouse button; therefore the getmousekey() returns values like 'unknown',or 'shift-unknown' (the heading and trailing '-' are always trimmed)
        // for left mouse button only, run drag and drop to change node parent
        if (getmousekey() === 'unknown'){///!!! make a video about it
            mouseup_dragdrop_primary();
        } 
        if (getmousekey() === 'shift-unknown') {
            // console.log('shift key pressed when mouse is up')
            mouseup_dragdrop_shiftprimary () ;
        }
    }

    // on shift - mouse up, do the following
    function mouseup_dragdrop_shiftprimary () {          
        var mousemove=0, mousedown=0; // these are for debug purpose

        //remove the pseudo link
        thepseudolink.remove()

        /** if theTgtD3Obj not null, not undefined:
         * 1) find .data.custparents of theTgtD3Obj
         * 1) add the idx of theSrcD3Obj into the custparents of theTgtD3Obj
         * 3) run MakeChangeTree()
         */
        var theSrcIdx;
        if (theTgtD3Obj !== null && theTgtD3Obj != undefined){
            //0) get the idx of the source d3 obj
            theSrcD3Obj.attr("fakeattr", d=>{
                theSrcIdx = d.data.idx;
            })
            
            var addcustlink =0; 

            //1) find and update .data.custparents of theTgtD3Obj
            theTgtD3Obj.attr("fakeattr", function(d){
                // console.log('data binding to the target node')
                // console.log(d)
                var srcIdxExist=0;
                if (d.data.custparents === null || d.data.custparents === undefined){
                    d.data.custparents=[]
                    // inidicate that the srcIdx does not exist
                    // !!! but do not push the srcIdx yet, as the srcIdx might be d.data.idx itself. In that case, srcIdxExist should be 1, i.e., the node itself cannot be its custparent
                    srcIdxExist =0;
                } else {                    
                    // if theSrcIdx is the target nodes's idx, let srcIdxExist=1 (do not add its own idx to its custparents)
                    if (d.data.idx === theSrcIdx ){
                        srcIdxExist=1;
                    }
                    // loop and check if theSrcIdx is in the list. If so, let srcIdxExist=1
                    d.data.custparents.forEach(e=>{
                        if (e.idx === theSrcIdx) {
                            srcIdxExist =1;
                        } 
                    })
                }
                if (srcIdxExist === 0){ // if theSrcIdx does not exist, add it to the parent list
                    d.data.custparents.push({'idx': theSrcIdx})
                    addcustlink=1;
                }                
            })
            //add cross line
            if (addcustlink === 1){
                // console.log(addcustlink)
                var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
                //   console.log(proposedTreesize.width, proposedTreesize.height)
                rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
            
                // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
                treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
                updateTree= MakeChangeTree(rootdatapoint_sortedrowscols) 
                pan()
                custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate )
            } 
            
            d3.event.stopPropagation()   // stop mouseover??           
            
        }
    } // mouseup_dragdrop_shiftprimary



    function mousemove_dragdrop_shiftprimary () {

        d3.event.preventDefault();// prevent the default text dragging

        // determine the src d3obj
        theSrcD3Obj=theSelectedObj;
        // console.log(theSrcD3Obj)

        //************************************************************************************ */        

        // when mouse move, let the pseudo g move with the mouse, get the coordinates relative to the tree rect
        var tmpxyarray=d3.mouse(thetreeG.node());
        //calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
        var
        mousecurrentxy = {"y": parseInt(tmpxyarray[0]), "x": parseInt(tmpxyarray[1])}; // y is horizontal, x vertical in d3 horizontal tree

        //transit the path
        thepseudolink.transition()
            .duration(0)
            .attr("stroke-opacity", 1)
            .attr('d', function(d){ return diagonal(theSrcXY, mousecurrentxy)});

        //************************************************************************************ */
        
        /**check if mouse is over a g group, remember it as the targetD3Obj */
        d3.selectAll('g.nodeGs')    
            .attr('pointer-events', 'mouseover') //? is this line a must???
            .on("mouseover", function(d){

                // Remember the data point corresponding to the node group that the mouse is over
                theTgtD3Obj = d3.select(this)
                // console.log ('mouse is over ===')
                // console.log(d)
                // console.log(theTgtD3Obj)
                //mouseoverObj.select('circle.nodecircles').style('fill', nodecircle_fill_dragover_color);
            })
            .on("mouseout", function(d){
                theTgtD3Obj = null;
            })
        ;

    } //end mousemove_dragdrop_shiftprimary



    function mousemove_dragdrop_primary () {
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
    function mouseup_dragdrop_primary () {          
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
                                    getdescendants_hiddenchildren(v)// must have !!! for .children._children, also need  to update the depth

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
                                    getdescendants_shownchildren(v) // must have !!! for ._children.children, also need to update the depth
                                })
                            }
                        }
                        getdescendants_hiddenchildren(d);


                        // within originalParentData's children find the one which equals to the selected obj data, and remove it from the children array
                        for (i=0; i < originalParentData.children.length;i++ ){
                            if (originalParentData.children[i] === theSelectedObjData){
                                originalParentData.children.splice(i, 1); //use splice() only when there is ONE matched item
                                break;
                            }
                        }
                        for (i=0;i<originalParentData.data.children.length;i++ ){
                            if (originalParentData.data.children[i] === theSelectedObjData.data){
                                originalParentData.data.children.splice(i, 1); //use splice() only when there is ONE matched item
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
                        var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
                        //   console.log(proposedTreesize.width, proposedTreesize.height)
                        rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
                      
                        // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
                        treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
                        updateTree= MakeChangeTree(rootdatapoint_sortedrowscols) 
                        pan()
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

        // resume rightclick  actions for showing contextmenu
        d3.selectAll('g.nodeGs').on("contextmenu", d3.contextMenu(nodemenu))
    }

} // end drag drop


// to pan the tree (press mouse button down, hold and move the tree diagram within the svg box)
function pan () {


    // listen to mousedown and mouseup actions
    d3.select(window)
        .on('mousedown', mousedown_pan)
        .on('mouseup', mouseup_pan)

    function mousedown_pan() {

        //////d3.event.preventDefault(); //!!! must have! to avoid text dragging
        // well it causes the description input modal stop working, do not use it!!!!
        
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



	//sava tasks and crosslinks into a local JSON file
	function exportData_local_d3v4(){
		//expand all
		//expandAll(theGrandRoot_obj) //it causes error and stop exporting
		
        //newidea, purify the root data by only selecting the ones won't causing circular structure
        var thesrcdata=[rootdatapoint_sortedrowscols.data]// this is for v4, as the root data structure is different from that of v3
        //However, simply taking the .data part at the root level is good enough, as the data inside has the same structure  as thatof v3


        // console.log(thesrcdata)
		var updatedData=selectCopy(thesrcdata)		
        // console.log(updatedData)	
        	
		var fileName = "myData";
		//save it to local disk
		saveData(updatedData, fileName);		
    }
    
    /* a function to save JSON*/
	var saveData = (function () {
		/*In the function, create an invisible element, which is a hyperlink named 'a'*/
		var a = document.createElement("a");
			/*in the body section of the current document, create a child element, with a tag name of 'a' (in html, those tagged 'a' is for hyperlink*/
				document.body.appendChild(a);
				/*make it invisible*/
				a.style = "display: none";
				/*the next is to return strings from the second function as command lines.
					for the second function, the parameters 'data' and 'filename' are from the first function*/
				return function (data, fileName) {
					/*create a variable called 'json', to make the object 'data' into plain text*/
					var json = JSON.stringify(data),
						/*create a blob object
							a blob is a file like object.
							https://developer.mozilla.org/en-US/docs/Web/API/Blob
							make it a binary type (octet/strem)
						*/
						blob = new Blob([json], {type: "octet/stream"}),
						/*Pop up a window, for saving the created blob object*/
						url = window.URL.createObjectURL(blob);
						
						/*make the link of the a element as the url*/
						a.href = url;
						/*set the name of the downloaded file*/
						a.download = fileName;
						/*click to go to the url, i.e., to open the SavaAs window*/
						a.click();
						/*display the savaAs window*/
						window.URL.revokeObjectURL(url);
						};
	}());


//select the properties to be copied into the cleaned JSON for export
//this part is updated as the root data structure changed in d3v4
function selectCopy(obj){
	var ar2 = []; // create empty array to hold copy

	for (var i = 0, len = obj.length; i < len; i++) {
		ar2[i] = {}; // empty object to hold properties added below
		for (var prop in obj[i]) {
			if(
			prop === "idx" ||
			prop === "name" ||
			prop === "NodeDescription"||
            prop === "custparents"
			) {
			ar2[i][prop] = obj[i][prop]; // copy properties from arObj to ar2
			}
			if (prop === "children" && obj[i][prop] !== null){
				var theNewChildren=[];
				var theChildren = obj[i][prop];
				//console.log("theChildren")
				//console.log(theChildren)
				theChildren.forEach(function(d){
				//console.log("theChild")
				//console.log([d])
					var theNewKid= selectCopy([d]);
					
					if (theNewKid[0][0]=== undefined){
						var theNewKid2=theNewKid[0];
					}else{
						var theNewKid2=theNewKid[0][0];
					}
					//console.log("theNewKid")
					//console.log(theNewKid2)
					theNewChildren.push(theNewKid2);
				})
				ar2[i][prop]=theNewChildren;
			}//children
			if (prop === "_children" && obj[i][prop] !== null){
				var theNewChildren=[];
				var theChildren = obj[i][prop];
				//console.log("_theChildren")
				//console.log(theChildren)
				theChildren.forEach(function(d){
				//console.log("_theChild")
				//console.log([d])
					var theNewKid= selectCopy([d]);
					
					if (theNewKid[0][0]=== undefined){
						var theNewKid2=theNewKid[0];
					}else{
						var theNewKid2=theNewKid[0][0];
					}
					//console.log("theNewKid")
					//console.log(theNewKid2)
					theNewChildren.push(theNewKid2);
				})
				ar2[i][prop]=theNewChildren;
			}//_children
			if (prop === "_subjson"){
				var theNewChildren=[];
				var theChildren = obj[i][prop];
				//console.log("theChildren")
				//console.log(theChildren)
				theChildren.forEach(function(d){
				//console.log("theChild")
				//console.log([d])
					var theNewKid= selectCopy([d]);
					
					if (theNewKid[0][0]=== undefined){
						var theNewKid2=theNewKid[0];
					}else{
						var theNewKid2=theNewKid[0][0];
					}
					//console.log("theNewKid")
					//console.log(theNewKid[0][0])
					theNewChildren.push(theNewKid2);
				})
				ar2[i][prop]=theNewChildren;
			}//_subjson
		}
	};
	return ar2;
}	
    


/*contextmenu************************************************
https://bl.ocks.org/adamfeuer/042bfa0dde0059e2b288
*/
d3.contextMenu = function (menu, openCallback) {


	// create the div element that will hold the context menu
	d3.selectAll('.d3-context-menu').data([1])
		.enter()
		.append('div')
		.attr('class', 'd3-context-menu');

	// close menu
    d3.select('body').on('click.d3-context-menu', function() {
		d3.select('.d3-context-menu').style('display', 'none');
    });

	// this gets executed when a contextmenu event occurs
	return function(data, index) {
        var elm = this;

		d3.selectAll('.d3-context-menu').html('');
		var list = d3.selectAll('.d3-context-menu').append('ul');
		list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function(d) {
				return (typeof d.title === 'string') ? d.title : d.title(data);
			})
			.on('click', function(d, i) {
				d.action(elm, data, index);
                d3.select('.d3-context-menu').style('display', 'none');
			});

		// the openCallback allows an action to fire before the menu is displayed
		// an example usage would be closing a tooltip
		if (openCallback) {
			if (openCallback(data, index) === false) {
				return;
			}
		}

		// display context menu
		d3.select('.d3-context-menu')
			.style('left', (d3.event.pageX - 2) + 'px')
			.style('top', (d3.event.pageY - 2) + 'px')
			.style('display', 'block');

		d3.event.preventDefault();
        d3.event.stopPropagation();
        d3.select(window).on('mousedown', null) //// !!!! must have. Without it, it'll trigger mouse down for panning
        pan()// !!!! must have. Without it, pan function stopped by the line above (i.e., stop listening to mousedown)
	};
};
/*End of contextmenu*************************************************/



/**The following part is to delete a new node**************** */

function deleteNode(theNode){
    //determine the parent of theNode
    var theParent=theNode.parent;
    // console.log('the new node before deleting ===')
    // console.log(theNode)
    //if the node has parent, find theNode as the children of its parent
    if (theParent !== undefined && theParent !== null ){
        for (i=0;i<theParent.children.length;i++){
            if (theParent.data.children[i].idx === theNode.data.idx){//d3v4 (add .data)
//console.log(i, theParent.children[i].idx)
                theParent.children.splice(i,1) //use splice() only when there is ONE matched item
                theParent.data.children.splice(i,1) //d3v4 //use splice() only when there is ONE matched item
//console.log(i, theParent.children)
            }
        }
    }
    // console.log(theParent.children.length)
    if (theParent.children.length === 0) { // theParent.children === [] does not work
        delete theParent['children']
        // console.log(theParent)
    } // new from try 89 (if .children = [], remove .children )
    if (theParent.data.children.length === 0) {
        delete theParent.data['children']
    } // new from try 89 (if .data.children = [], remove .children )
}

//confirm to delete
function confirmDelete(){
    var del = confirm("Confirm to delete!");
  return del;
}

/**The above part is to delete a new node**************** */


/**The following part is  to creating a new node**************** */
function showCreateForm(){

	// Get the modal
    var modal = document.getElementById('theModal');

    // Get the button that opens the modal
    //var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementById("ModalClose");

    // When the user clicks on the button, open the modal 
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        //remove the modal
        $('#theModal').remove();
    }

    // When the user clicks anywhere outside of the modal, close it? no, do nothing
    window.onclick = function(event) {
        if (event.target !== modal) {
        //remove the modal
        //$('#theModal').remove();
        }
    }

    
}

function closeNewNodeModal(){
	document.getElementById('NewNode').style.display = "none";
}


function createNode() {

    // console.log(theParentToAppendChild) // it is defined in the var 'menu' (init.js). It is the data point of the node right clicked for creating node
    
    var name = $('#ModalInput').val();
    //create an uid for the new node
    var theUID='MY' + generateUUID();
    /**Following is the structure of a new data point:
     * .data
     *      .idx
     *      .name
     * .depth: <the parent node's depth + 1>
     * .height:0
     * .parent: <the node to which the new node will be appended>     
     * .x0 <the parent node's x>* 
     * .y0 (the parent node's y)
     */
    var theNewKid = 
        {// modified from try 89
        'data': {
            'idx':theUID,
            'name': name
        },
        'depth': theParentToAppendChild.depth + 1,
        'height': 0, 
        'parent': theParentToAppendChild,
        'x0': theParentToAppendChild.x,
        'y0': theParentToAppendChild.y
    }


    // console.log(theNewKid)
    // console.log(theParentToAppendChild)

    //push it into theParentToAppendChild;
    //if there is no children, nor _children
    if ((theParentToAppendChild.children === undefined ||  theParentToAppendChild.children === null)
            && (theParentToAppendChild._children === undefined || theParentToAppendChild._children === null)
    ){
        theParentToAppendChild.children=[];
        theParentToAppendChild.children.push(theNewKid); // if both .children and ._children are null or undefined
        theParentToAppendChild.data.children=[];
        theParentToAppendChild.data.children.push(theNewKid.data) // new in d3V4
    }else{
        if ( (theParentToAppendChild.children === null  || theParentToAppendChild.children ===undefined) 
                    &&  theParentToAppendChild._children !== null && theParentToAppendChild._children !==undefined								
        ){
            theParentToAppendChild._children.push(theNewKid);	// if .children is null/undefined, but _children is not	
            theParentToAppendChild.data.children.push(theNewKid.data) // new in d3v4. hmm, in .data, it is always like data.children, nothing like data._children			
        }else {
                if ( theParentToAppendChild.children !== null  && theParentToAppendChild.children !== undefined  ) {
                    theParentToAppendChild.children.push(theNewKid); // if ._children is null/undefined, but .children is not
                    theParentToAppendChild.data.children.push(theNewKid.data) // new in d3V4
                }else {
                    console.log("something is wrong, line 1751") // if both .children and ._children have things inside
                }
        }
    }
    
    //remove the modal
    $('#theModal').remove(); //modified from try89


    //do the make chagnge tree, and also do the custline updateTree(theParentToAppendChild.tree_obj.dataroot)
    var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(theParentToAppendChild);
    pan ()
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
    // console.log('rootdatapoint_sortedrowscols ===')
    // console.log(rootdatapoint_sortedrowscols)

    
}

/**The above part is to creating a new node**************** */



/** the following part is to rename a node */
//https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal_bottom	
function showRenameForm(){

	// Get the modal
		var modal = document.getElementById('theModal');

		// Get the button that opens the modal
		//var btn = document.getElementById("myBtn");

		// Get the <span> element that closes the modal
		var span = document.getElementById("ModalClose");

		// When the user clicks on the button, open the modal 
//		d.onclick = function() {
		  modal.style.display = "block";
//		}

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
          modal.style.display = "none";
          $('#theModal').remove();
		}

		// When the user clicks anywhere outside of the modal, close it? No, do nothing
		window.onclick = function(event) {
		  if (event.target == modal) {
            //$('#theModal').remove();
		  }
		}
}

function renameNode() {

    var name = $('#ModalInput').val();
    //console.log('New Node name: ' + name);
    theNodeToRename.data.name = name;
    //close the pop up menu
    $('#theModal').remove();

    //!!! must have. the renamed node won't be displayed unless the clicked node is removed and redepolyed!
    theNodetoRenameElm.remove();

    //do the make chagnge tree, and also do the custline updateTree(theParentToAppendChild.tree_obj.dataroot)
    var proposedTreesize=estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height /2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(theNodeToRename);
    pan ()
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from
}

/** the following part is to rename a node */





/**the following is related to create a modal for description editing */ 
function showInputTextForm(){

    // Get the modal
    var modal = document.getElementById('theModal');

    // Get the button that opens the modal
    //var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementById("ModalClose");

    // When the user clicks on the button, open the modal 
    modal.style.display = "block";

    //get the first element with class name = modal-content
    var modalcontentbox = modal.getElementsByClassName('modal-content')[0];

	modalcontentbox.style.width="80%";
	modalcontentbox.style.height="80%";
// console.log(NicEditInputInstance)
	//if NicEditInputInstance has not been created, create it
	if (NicEditInputInstance === undefined) {

        //create a textarea in the box "myInputBox"
        //<textarea id="NicEdit" cols="180" rows="30">Some this Text</textarea>
        var myInputBox=document.getElementById("myInputBox");
        
        d3.select("#myInputBox").append("textarea")
            .attr("id", "NicEdit")
            .attr("cols", "120")
            .attr("rows", "36")
            .on('click', function(){
                console.log('textarea clicked')
            })
            .text(function(){
                if(currentDataEle.data.NodeDescription !== undefined ){
                    return currentDataEle.data.NodeDescription;
                }else { return "";}
            })
        ;
        
        //	console.log("create for the first time")
        NicEditInputInstance= new nicEditor().panelInstance('NicEdit');
        //https://stackoverflow.com/questions/11704769/nicedit-in-hidden-div-is-resized-small
        $('.nicEdit-panelContain').parent().width('100%');
        $('.nicEdit-panelContain').parent().next().width('100%');
			 
	}
		
		//load the existing contents. Has to load into 1) the main div box, and 2), the hidden textarea
//console.log(currentDataEle.data.NodeDescription)
    if (currentDataEle.data.NodeDescription !== undefined){
        //console.log("before")			
        //console.log(NicEditInputInstance)
        //document.getElementById("NicEdit").style.display="block";
        
        //load the existing description into the main div
        // console.log('theinputmaindiv outside if=======')
        // console.log(theInputMainDiv)
        if (theInputMainDiv!==undefined) {

            // console.log('theinputmaindiv inside if=======')
            // console.log(theInputMainDiv)

            theInputMainDiv.value=currentDataEle.data.NodeDescription; //d3v4
            theInputMainDiv.innerHTML=currentDataEle.data.NodeDescription;
            // theInputMainDiv.css('overflow', 'auto')
            theInputMainDiv.style.overflow = 'auto';
        }
        //load the existing description into the textarea;
        // console.log(currentDataEle)
        document.getElementById("NicEdit").value=currentDataEle.data.NodeDescription; //d3v4
        document.getElementById("NicEdit").innerHTML=currentDataEle.data.NodeDescription; //d3v4
        
        //console.log(theInputMainDiv);
        //console.log(document.getElementById("NicEdit").innerHTML);
        //console.log(document.getElementById("NicEdit").value);
        //console.log(currentDataEle.name + ", " + currentDataEle.data.NodeDescription);			
        //console.log(document.getElementById("NicEdit").innerHTML);
    }		

	InputTextChangeListener();

    //console.log(currentDataEle.data.NodeDescription);
    
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        
        modal.style.display = "none";

        //   //clean up the contents in both the main div, and the hidden textarea
        document.getElementById("NicEdit").value="";
        document.getElementById("NicEdit").innerHTML="";
        if(theInputMainDiv !== undefined) {
            theInputMainDiv.value="";
            theInputMainDiv.innerHTML="";
        }

        NicEditInputInstance = undefined; // must have!!!! so that the textarea will be recreated...
        $('#theModal').remove();// delete NicEditInputInstance;
        

        //v("at closing")
        //console.log("thetextArea = " + document.getElementById("NicEdit").value)
        //console.log("thetextArea = " + document.getElementById("NicEdit").innerHTML)
        //console.log(currentDataEle.name + ", " + currentDataEle.data.NodeDescription)
    }

    // When the user clicks anywhere outside of the modal, close it // no, do nothing
    window.onclick = function(event) {
        if (event.target == modal) {
        // modal.style.display = "none";			
        }
    }

}//end of show input form


//best embedding formatted text editors (the NicEdit is the best)
//https://smartbear.com/blog/develop/five-free-javascript-libraries-to-add-text-editing/
function InputTextChangeListener(){
	var myInputBox=document.getElementById("myInputBox");    
    // console.log(myInputBox)
    myInputBox.addEventListener("input", function(event) { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        inputTextChangeUpdate();
    })
}

function inputTextChangeUpdate(){
	
    //nicEditors.findEditor('NicEdit').saveContent();
    // var theDivs=d3.selectAll("div")[0];// d3v3
    var theDivs=d3.selectAll("div")['_groups'][0]; // d3v4, [0][0] does not work!
    // console.log(theDivs)
    //find theDIV with the class name containing 'nicEdit-main'
    theDivs.forEach(function(d){
        theClassName =d.className	
        if (/nicEdit-button/i.test(theClassName) ){

        //https://www.w3schools.com/cssref/css3_pr_background-origin.asp
        //the toolbox icons are small and ugly. but to change need redefine the url of icon gifs.
        //console.log(d)
            //d.style.backgroundRepeat="no-repeat";
            //d.style.backgroundSize="auto"

            //d.background-size="contain";
            //d.style.width = "40px";
            //d.style.height="40px";
            
        }
        //if (theClassName.includes("nicEdit-main")){console.log(theClassName)
        if (/nicEdit-main/i.test(theClassName)){
            // console.log(d)
            //save d.innerHTML into currentDataEle as NodeDescription;
            theInputMainDiv=d;
            currentDataEle.data.NodeDescription = d.innerHTML
// console.log(theInputMainDiv)
// console.log(currentDataEle)
            theInputMainDiv.style.overflow = 'auto';
            theInputMainDiv.style.width='100%';
            theInputMainDiv.style.height='400px';
            theInputMainDiv.style.minHeight='200px';
            //console.log(currentDataEle.data.NodeDescription)
        }
    })
}

/**the above is to create a modal for description editing */ 




//make a modal for adding a new node, rename a node, and description editing. The modal will be created and removed each time
function makemodal(id, title, label, action){
    /**1.make a background
        this is to add a halfly transparent div on top of the current page. 
        It is to make a 'dim' effect of the whole page
    */ 
    var modalbackground = d3body
        .append('div')
        .attrs({'id': id, 'class': 'myModal'}) // id (e.g., theModal)
    
    /**2. within the background, create a dialog box 
     *  this is a box of the whole dialog area
    */
    var modaldialogbox = modalbackground.append('div').attrs({'class': 'modal-content'}) // this is a box of the whole dialog area
        .on('mousedown', d=>{ // the following is to prevent thetreeG moving when the mouse is down and moving within the modal area 
            event.stopPropagation();
        }) 

    /**3a. within the dialog box, create a header div */
    var modalheader=modaldialogbox.append('div').attrs({'class': 'modal-header'})

        /**3a.1 within the header, create a span as the modal close button*/
        var modalclosebutton=modalheader.append('span').attrs({'class': 'close', 'id':'ModalClose'} ).html('x')
        /**3a.2 within the header, create a h2 as the modal title*/
        var modalboxtitle=modalheader.append('h2').html(title) // modal header title ('e.g, Append a new node)

    /**3b. within the dialog box, create the body div */
    var modalbody = modaldialogbox.append('div').attrs({'class': 'modal-body'}) 

    // if 'title' is 'Description' make the description type modal, else make a type for rename, del, new node, etc.
    if (title === 'Description') {
        //change the modal boxtitle by adding the title
        modalboxtitle.html(title + ": " + currentDataEle.data.name)
        modalbody.attrs({'id':'myInputBox'}).styles({"overflow": "auto;"}) 
        //modalbody.append('script').attr('src', 'http://js.nicedit.com/nicEdit-latest.js') // problem! it does not work to change to https://js.nicedit.com/nicEdit-latest.js http: cannot be used on netlify
        modalbody.append('script').attr('src', 'tools/nicEdit/nicEdit.js') // the file was downloaded from http://nicedit.com/download.php

    } else { //make a type of modal for rename, del, new node, etc

        /**3b1. within the body box, create the body title h2 */
        // var modalbodytitle = modalbody.append('h2').attrs({'id': 'modalTitle'}).html('Create Node')  // modal body title

        /**3b2. within the body box, create a div to hold rows that appears in the body */
        var modalbodyrow = modalbody.append('div').attrs({'class': 'row'})

        /**3b2a. within the body row div, create a div to hold body row contents */
        var modalbodyrowcontents = modalbodyrow.append('div').attrs({'class': 'large-12 columns'})

            /**3b2a1. within the body row contents div, create a label to indicate 'Node name' */
            var modalbodyrowcontentslabel = modalbodyrowcontents.append('label').text(label)  // prompt str, e.g 'Node name'
                /**3b2a1a. within the body row contents label, create an input DOM element to indicate 'Node name' */
                var modalbodyrowcontentslabelinput = modalbodyrowcontentslabel.append('input')
                    .attrs({'type':'text','class':'inputName', 'id':'ModalInput'}) //CreateNodeName
                    .styles({'placehoder':'node name', 'width':'80%'})
                /**3b2a1b. within the body row contents label, create a button to submit input */
                var modalbodyrowcontentslabelbutton = modalbodyrowcontentslabel.append('button')
                    .attrs({'onclick':action}) // e.g.,'createNode()' 
                    .text('OK')
    }
}


//check if the data ele contains nodeDescription, and the nodeDescription contains [to do]
function checkToDo(dataEle){
	var theNodeDesc;
	if (dataEle.data.NodeDescription){theNodeDesc=dataEle.data.NodeDescription} ; //d3v4
	var theResult=0;
	if (theNodeDesc !== undefined && /\[to Do\]/i.test(theNodeDesc)){
//		console.log(/\[to Do\]/i.test(theNodeDesc));
		theResult= 1;
	}
	return theResult;
}



/**The following is to show textbox and link text to treenode *************************** */

//get the text beween tags (e.g., ///t t///)
function getContentsBetweenTags(d, tags){
    
    var starttag = tags[0], endtag=tags[1];

    // set the default result = ''
    var result='' ;

    //check if the text contains the start delimiter
    if (d.includes(starttag) ) {
        // get the text segment after the start tag (e.g., '///t'...)
        var textseg1=d.split(starttag)[1]
        //check if the text contains the end delimiter
        if (d.includes(endtag)){
            result = textseg1.split(endtag)[0].trim()
        }
    }
    return result
}


//recursively get sentences to show (betweeen ///t and t///) from nodedescription
function getNodeSentences(obj){
//console.log(obj)
    var result = []; // create empty array to hold copy
        //revised, get the contents between ///t t///
    if (obj.data.NodeDescription !== undefined){ //d3v4
        // get the text between ///t and t///
        var theTmpNodeContents= getContentsBetweenTags(obj.data.NodeDescription, ['///t', 't///']) //d3v4
// console.log('theTmpNodeContents of ' + obj.data.idx)
// console.log(theTmpNodeContents)
        // if the contents is not '', get the idx
        if (theTmpNodeContents !== '') {
            // get the idx
            var theTmpidx=obj.data.idx;
            // make a map of .idx, and .content
            var theTmp= {'idx': theTmpidx, 'content': theTmpNodeContents};
            // push the map into the result array
// console.log(theTmp)
            result.push(theTmp)
        }
    }

    //if there are children nodes
    if (obj.children !== null & obj.children !== undefined){
        var theChildren = obj.children;
// console.log("theChildren")
// console.log(theChildren)
        theChildren.forEach(function(d){
// console.log("theChild")
// console.log(d)
            var result_children= getNodeSentences(d);
// console.log("result_children")
// console.log(result_children)           
            //push each ele in result_children into result
            result_children.forEach(function(e){
                result.push(e)						
            })
        })
    }

    // do not get the contents in _children ()
    // if (obj._children !== null & obj._children !==undefined){
    //     var theChildren = obj._children;
    //     //console.log("theChildren")
    //     //console.log(theChildren)
    //     theChildren.forEach(function(d){
    //     //console.log("theChild")
    //     //console.log([d])
    //         var result_children= getNodeSentences(d);
            
    //         //push each ele in result_children into result
    //         result_children.forEach(function(e){
    //             result.push(e)						
    //         })
    //     })
    // }
        
    // //_subjson need to check...
    // if (obj._subjson !== null & obj._subjson !==undefined){
    //     var theChildren = obj._subjson;
    //     //console.log("theChildren")
    //     //console.log(theChildren)
    //     theChildren.forEach(function(d){
    //     //console.log("theChild")
    //     //console.log([d])
    //         var result_subjson= getNodeSentences(d);
            
    //         //push each ele in result_subjson into result
    //         result_subjson.forEach(function(e){
    //             result.push(e)						
    //         })
    //     })
    // }//_subjson

	return result;
}	

//change the contents: replacing <div></div> by </br>
function replaceDIVbyBR(d){
                
    // set the default result = ''
    var result='' ;

    // replace <div> with nothing
    stripdiv=d.replace('<div>', '')
    // replace </div> with a line breaker </br>
    result=stripdiv.replace('</div>', '</br>')    

    return result
}



function showSentences(){

    $('.textviewbox').width(width_textviewbox);

    //display the textBox and the hintBox
    $("#textBox").css('display', "block");
    $("#textBox").css('height', "auto");
    $("#hintBox").css('display', "block");
    $("#hintBox").css('height', "auto");

    //empty all contents (the text, the child and other descendant elements)
    $("#textBox").empty()
    
    //get the sentences (recursively search each node, and get description html from the nodes without descendant elements)
    var theContents= getNodeSentences(rootdatapoint_sortedrowscols);
// console.log(rootdatapoint_sortedrowscols)
// console.log(theContents)
    theContents.forEach(function(d){
// console.log(d)
        /**The .content by nicEdit is in html format
         * Lines of contents are put in separate divs, except that if there is only one line
         *  (e.g., ///t <thecontents> t///). In case of just having one line, there is no div wrapping .thecontents. 
         */
        // the problem is that <div> force the sentences to change line. The solution is to strip the div, and replace with </br>. 
        // That way, sentences without <div> will be put in one line by <span> (in node description's show text part, not indicated to change line), 
        cleanedContent=replaceDIVbyBR(d.content)
// console.log(cleanedContent)
        var theSentenceHTML=
        "<span idx='" + d.idx + "' class='showtext'" + "onmouseover='onsentencehover(this)'"
        + "onmouseout='onsentenceout(this)'>"
        + cleanedContent 
        + "&nbsp</span>";        

        $("#textBox").append(theSentenceHTML)
    });

    //right click to lock
    CtrlClickToLock();

    // listen to changes in the text box
    ShowSentenceChangeListener()

}// end showSentences()

/** the following are related to lock of nodes when a span jof show text is selected by ctrl-click */
// when the show text is clicked, run showtextonclick
function CtrlClickToLock(){
    thetextbox.selectAll('span.showtext')
        .on('click', showtextonclick)
}
//check the mouse key, if it is ctrl-unknown (a ctrl-click, toggle the locknode status)
function showtextonclick(){

    // console.log('a show text span was clicked')
    var themousekey = getmousekey()
    // console.log('themousekey ======')
    // console.log(themousekey)
    //for click, the last mouse action is mouse up. For mouse up, the mouse button is 'unknown'
    //therefore ctrl-click indeed returns: ctrl-unknown
    if (themousekey === 'ctrl-unknown') {
        if (locknode === 1) {locknode=0}else{locknode=1};
        // console.log('the node lock status = ' + locknode)
    } 
}
/**the above are related to lock of nodes when a span jof show text is selected by ctrl-click */



// on sentencehover, centerize the node in the tree diagram
function onsentencehover(theEle){

    //only take actions if the locknode status is not 1
    if (locknode != 1) {

        // change color of the selected text
        theEle.style.backgroundColor = "grey" //"#4677f8";
        theEle.style.color="#fefefe";
        theEle.style.outline = "5px solid grey"; //#66ff66
        var theidx=$(theEle).attr('idx')
        // console.log('theidx')
        // console.log(theidx)

        //according to idx, get the node obj containing .idx, .data, .elm, and .d3obj 
        var theTreeNode=getNodeByIdx(theidx)

        //enlarge the node circle, make the text bold with box
        theTreeNode.d3obj.select('circle')
            .styles({'fill':"lightgrey"})
            .attrs({"stroke-width":nodecircle_border_width*2,
                "r":nodecircle_radius*2
            })

        CentralNode_selectedText(theTreeNode.data)

        //show hint text for the selected idx
        ShowHintText(theTreeNode.data)
        }
}


//on mouse moving out of the sentence, unhighlight the sentence, and returnt the circle to normal
function onsentenceout(theEle){

    //only take actions if the locknode status is not 1
    if (locknode != 1) {

        theEle.style.backgroundColor = "initial";
        theEle.style.color="initial";
        theEle.style.outline = "initial";
        var theidx=$(theEle).attr('idx')

        //according to idx, get the node obj containing .idx, .data, .elm, and .d3obj 
        var theTreeNode=getNodeByIdx(theidx)
            
        //enlarge the node circle, make the text bold with box
        theTreeNode.d3obj.select('circle')
            .style('fill', function(d) {
                return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color; 
            })
            .attrs({"stroke-width":nodecircle_border_width,
                "r":nodecircle_radius
            });
    }
}


// according to idx, find the node DOM ele, the node d3data, and the node data
function getNodeByIdx(theidx){

    // set default result
    var result ={
        'idx': null, 
        'data': null,
        'elm': null,
        'd3obj':null       
    }
    //find the node(its attr (idx = d.idx), this is done by d3v4.
    //loop for all datapoints binding to a nodeG
    var thenodeD3Objs = thetreeG.selectAll('g.nodeGs')
    // console.log('thenodeD3Objs')
    // console.log(thenodeD3Objs)
    
    thenodeD3Objs.attr('fakeattr', (e, i)=>{
        if (e.data.idx === theidx){ //d3v4
            var theNodeData = e
            var theNodeDOMEle = thenodeD3Objs['_groups'][0][i] // d3v4
            var theNodeD3Obj = d3.select(theNodeDOMEle)
            result= {
                'idx': theidx, 
                'data': theNodeData,
                'elm': theNodeDOMEle,
                'd3obj':theNodeD3Obj
            }
            // console.log(result)
        }
    });
    return result
}


/**the function to zero in the node corresponding to the text hovered on in the text view box 
 * It is similar to ZoomInOutSelectedNode(). But it does not enlarge the diagram map
*/
//ZoomInCentralNode: zoom in out the selected note
function CentralNode_selectedText(d){

    //disable the default right click menu
    //d3.event.preventDefault();  cause error when running onsentencehover()

    // need to stop listening to mousemove (which is trigger by pantree )
    d3.select(window).on('mousemove', null) //!!! must have, otherwise the dragtree will hava error
    //event.stopPropagation(); does not work

    //5.1.1 initialzie the vars for x, y coordinates, and the zoom levels
    var x; //x coordinate (horizontal) of the center of the selected path/shape to the left wall of the map g
    var y; // y coordinate (vertical)
    //var xy_pathcenter; // an object containing data about the selected path/shape, including its x and y
    var translateStr; // a string to specify the travelling (i.e. translating) settings

    //5.1.2 determine the toggling settings (i.e., zoom in, select a new county, or zoom out)
    if (d) {
        //a. if a different county is selected
        
        //5.1.2.a.1 get the center of the selected shape/path
        // var xy_pathcenter = path.centroid(d);
        // console.log(d)
        y = d.x; //xy_pathcenter[0];
        x = d.y; //xy_pathcenter[1];

        //5.1.2.a.2 determine the string for zooming (scale)
        // the syntax is like 'scale(10)'
        //zoomLevel = 1;// zoomSettings.zoomLevel; do not change the current zoomLevel

        //5.1.2.a.3 update the centeredNode, i.e., let it be the currentl selected node
        centeredNode = d
    } 

    //5.1.3 determine the string for travel (translate)
    // the syntax is like 'translate (221, 176)'

    var currentsvgw = svg.attr('width')
    var currentsvgh = svg.attr('height')
    //unlike click and zoom in zoom out, this time, put the selected node 60px to the left, not at the horizontal center
    //var translate_mapUpperLeft='translate (' + width_treeviewbox/2 + ',' + height_treeviewbox/2 + ')'
    // by the way, the width_treeviwbox/2 height_treeviewbox/2 is not right. should be half of the current svg width and height
    var translate_mapUpperLeft='translate (' + 100 + ',' + currentsvgh/2 + ')'


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
   
}// end CentralNode_selectedText()



/**when the text in the textBox changed, make change in the nodedescription
 * It is impossible to detect input change in the <span> elements, therefore has to detect changes in the text box div.
 * the steps are
 * 1) save the current innerHTML of the <span> elements 
 * 2) detect change
 * 3) find which span element has changed value
 * 4) get the idx of the changed span
 * 5) find the corresponding tree node of the same .data.idx
 * 6) update the NodeDescription of the tree node using the changed innerHTML from the <span>
 * 
*/

function ShowSentenceChangeListener(){

    // 1) save the current innerHTML of the <span> elements 
    var theSpans_beforChange=document.getElementsByClassName("showtext");
	//push the contents into an array
	var _contentsBeforeChange =[];
	for (i=0;i<theSpans_beforChange.length;i++){ //forEach does not work for html collections
        _contentsBeforeChange.push({
            'idx':theSpans_beforChange[i].getAttribute('idx'), // this is the plain js way of getting attribute
            'content': theSpans_beforChange[i].innerHTML        
        })		
    }
    // console.log(_contentsBeforeChange)

    // 2) detect change
    thetextbox.node().addEventListener("input", d=> { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        on_textBoxInput()
    })

    // 3 to 6, on change
    function on_textBoxInput(){
        //3) find which span element has changed value
        theSpans_afterChange=document.getElementsByClassName("showtext");
        for (i=0;i<theSpans_afterChange.length;i++){ //forEach does not work for html collections
            var theidx = theSpans_afterChange[i].getAttribute('idx') // this is the plain js way of getting attribute
            var thecontent_afterchange  =theSpans_afterChange[i].innerHTML

            //3.1 find the content of the same idx before change
            var thecontent_beforechange;
            _contentsBeforeChange.forEach((h)=>{
                if (h.idx === theidx) { thecontent_beforechange = h.content} 
            })
            // 3.2 check if the content has changed 
            if (thecontent_beforechange !== undefined && thecontent_beforechange !== thecontent_afterchange) {
                // 3.3 replace the content changed before by the current content
                thecontent_beforechange = thecontent_afterchange
                // 4) get the idx of the span with changed content, which is theidx
                // 5) find the corresponding tree node of the same .data.idx
                var theNode= getNodeByIdx(theidx)
                // 6) update the NodeDescription of the tree node using the changed innerHTML from the <span>
                /**well this part cannot be directly copy. Can we?*/
                //From the node.nodedescription, remove the substr ///t....t///
                var theNodeDesc = theNode.data.data.NodeDescription;   
                //https://stackoverflow.com/questions/14867835/get-substring-between-two-characters-using-javascript             
                var theNodeDescTextSeg = '///t' 
                                        + theNodeDesc.substring(
                                            theNodeDesc.lastIndexOf('///t') + 4,
                                            theNodeDesc.lastIndexOf('t///')
                                        )  
                                        + 't///'
                ;

                //replace the text seg with changed text
                var theNodeDesc_changed=theNodeDesc.replace(theNodeDescTextSeg, ('///t' + thecontent_afterchange + 't///') )
                // save the changed node desc into the node.data.data.NodeDescription
                theNode.data.data.NodeDescription = theNodeDesc_changed
            }
		
        }

    }



    // // get an array of DOM elements of which the class name = 'showtext'
	// var theSpans=document.getElementsByClassName("showtext");
	// //push the sentences into an array to save the current text contents
	// var _sentences =[];
	// for (i=0;i<theSpans.length;i++){
	// 	_sentences.push(theSpans[i].innerText)		
	// }
    // var thetexBox=document.getElementById("textBox");
    // thetextbox.addEventListener("input", function(event) { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
    //     changed();
    // }) 
    
    // function changed(){
    //     console.log('changed ===')
    // }

    // thetextbox.node.addEventListener("input", function(d) { 
    //     console.log(d)
        // //get a collection of ele with class of "span"
        // var theNewSpans=$(d.target).find("span")
        // for (i=0;i<theNewSpans.length;i++){
        //     var theOldSpanText=	_sentences[i];
        //     var theNewSpanText = theNewSpans[i].innerText;
        //     if (theOldSpanText !==theNewSpanText){
        //         //console.log("span " + i + "changed")
        //         //save the changed into _sentences
        //         _sentences[i]=theNewSpanText;
        //         //update the nodedescription
        //             //get the idx
        //             var theIdx = theNewSpans[i].id
        //             //find the node(its attr (idx = d.id), this is done by jquery. 
        //             var theAttr= "[idx=" + theIdx + "]";
        //             var theNodeG= $(theAttr);
        //             //get the nodeData
        //             var theNodeData = theNodeG[0].__data__;
        //             //get the nodeData.NodeDescription
        //             var theNodeDesc=theNodeData.NodeDescription;
        //             //split the nodeDescription into two parts, one for sentence, on for hints
        //             var theNodeDescSentenceHintHTML = getNodeDescSentenceHintHTML(theNodeDesc);
        //             //replace the sentence part with theNewSpanText
        //             var theNewSentenceHTML = "<font size='3'>" + theNewSpanText + "</font>" ;
        //             var theNewSentenceHintHTML = theNewSentenceHTML + theNodeDescSentenceHintHTML.theHintsHTML;
        //             //save the updated NodeDescription into nodeData
        //             theNodeData.NodeDescription = theNewSentenceHintHTML;
        //             //console.log(theNodeData)
        //     }
        // }
    // })
} // end ShowSentenceChangeListener()


/**The above is to show textbox and link text to treenode *************************** */



/**The following is to show and edit hint box, and link the contents to node description **************/
// give the treenode data, get the clue/hint text in .data.NodeDescription
function ShowHintText(d) {
    // get the node description
    theNodeDesc= d.data.NodeDescription
    // console.log(theNodeDesc)

    // the old hint text is between ////clue and //// (this is to be compatible to the existing json files)
    thehintstr_tagclue = getContentsBetweenTags(theNodeDesc, ['////clue', '////'])
    // console.log(thehintstr_tagclue)
    // the new hint text is between ///h and h///
    thehintstr_taghint = getContentsBetweenTags(theNodeDesc, ['///h', 'h///'])
    // console.log(thehintstr_taghint)
    // put the old and new hint text together 
    thehintstr = thehintstr_tagclue + thehintstr_taghint

    //make a span and display the hintstr. Unlike showtext, for hint text it is not necessary to strip of the <div> tag. (There is only one node's hint text to display, no need to concatenate sentences from different nodes)
    var theHintHTML= "<span idx='" + d.data.idx + "' class='hinttext' >" + thehintstr  + "</span>";        
    //append it into the hintbox
    $("#hintBox").html(theHintHTML)

    // listen to changes in the hint box
    HintChangeListener()

} // end ShowHintText()


/**when the text in the hint changed, make change in the nodedescription
 * It is impossible to detect input change in the <span> elements, therefore has to detect changes in the text box div.
 * the steps are
 * 1) save the current innerHTML of the <span> elements 
 * 2) detect change
 * 3) find which span element has changed value
 * 4) get the idx of the changed span
 * 5) find the corresponding tree node of the same .data.idx
 * 6) update the NodeDescription of the tree node using the changed innerHTML from the <span>
 * 
*/

function HintChangeListener(){

    // 1) save the current innerHTML of the <span> elements 
    var theSpans_beforChange=document.getElementsByClassName("hinttext");
	//push the contents into an array
	var _contentsBeforeChange =[];
	for (i=0;i<theSpans_beforChange.length;i++){ //forEach does not work for html collections
        _contentsBeforeChange.push({
            'idx':theSpans_beforChange[i].getAttribute('idx'), // this is the plain js way of getting attribute
            'content': theSpans_beforChange[i].innerHTML        
        })		
    }
    // console.log(_contentsBeforeChange)

    // 2) detect change
    thehintbox.node().addEventListener("input", d=> { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        on_hintBoxInput()
    })

    // 3 to 6, on change
    function on_hintBoxInput(){
        //3) find which span element has changed value
        theSpans_afterChange=document.getElementsByClassName("hinttext");
        for (i=0;i<theSpans_afterChange.length;i++){ //forEach does not work for html collections
            var theidx = theSpans_afterChange[i].getAttribute('idx') // this is the plain js way of getting attribute
            var thecontent_afterchange  =theSpans_afterChange[i].innerHTML

            //3.1 find the content of the same idx before change
            var thecontent_beforechange;
            _contentsBeforeChange.forEach((h)=>{
                if (h.idx === theidx) { thecontent_beforechange = h.content} 
            })
            // 3.2 check if the content has changed 
            if (thecontent_beforechange !== undefined && thecontent_beforechange !== thecontent_afterchange) {
                // 3.3 replace the content changed before by the current content
                thecontent_beforechange = thecontent_afterchange
                // 4) get the idx of the span with changed content, which is theidx
                // 5) find the corresponding tree node of the same .data.idx
                var theNode= getNodeByIdx(theidx)
                // 6) update the NodeDescription of the tree node using the changed innerHTML from the <span>
                /**well this part cannot be directly copy. Can we?*/
                //From the node.nodedescription, remove the substr ///t....t///
                var theNodeDesc = theNode.data.data.NodeDescription;   
                //https://stackoverflow.com/questions/14867835/get-substring-between-two-characters-using-javascript             
                var theNodeDescTextSeg1 = '////clue' 
                                        + theNodeDesc.substring(
                                            theNodeDesc.lastIndexOf('////clue') + 8,
                                            theNodeDesc.lastIndexOf('////')
                                        )  
                                        + '////'
                ;
                var theNodeDescTextSeg2 = '///h' 
                                        + theNodeDesc.substring(
                                            theNodeDesc.lastIndexOf('///h') + 4,
                                            theNodeDesc.lastIndexOf('h///')
                                        )  
                                        + 'h///'
                ;

                //To replace the hint text, remove the existing hint text (no matter it is wrapped by old or new tag), and add the changed hint at the end
                // replace the hint text between old tag with nothing. 
                var theNodeDesc_changed1=theNodeDesc.replace(theNodeDescTextSeg1, '')
                //replace the hint text between ne tag with nothing.
                var theNodeDesc_changed2=theNodeDesc_changed1.replace(theNodeDescTextSeg2, '')
                // add the new text at the end of the descript
                var theNodeDesc_changed = theNodeDesc_changed2 + ('///h' + thecontent_afterchange + 'h///')
                
                // save the changed node desc into the node.data.data.NodeDescription
                theNode.data.data.NodeDescription = theNodeDesc_changed
            }
		
        }

    }

} // end on_hintBoxInput()
/**The above is to show and edit hint box, and link the contents to node description **************/


/** hide the textveiw box and the textbox */
function hideSentences(){
	$("#textBox").hide();
    $("#hintBox").hide();
    $('.textviewbox').width(0);
}




//ZoomInOutSelectedNode: zoom in out the selected note
function ZoomInTree(){
    //disable the default right click menu
    d3.event.preventDefault(); 
    zoomLevel=zoomLevel*1.5; //zoomLevel is a global var, saving the current zoomLevel
    var scaleStr = 'scale (' + zoomLevel + ')'
    thetreeG.transition()
        .duration(zoomSettings.duration)
        .ease(zoomSettings.ease) 
        .attr('transform', scaleStr)
    ;   
} // end ZoomInTree()
//ZoomInOutSelectedNode: zoom in out the selected note
function ZoomOutTree(){
    //disable the default right click menu
    d3.event.preventDefault(); 
    zoomLevel=zoomLevel/1.5; //zoomLevel is a global var, saving the current zoomLevel
    //if (zoomLevel <= 0){zoomLevel=1}
    var scaleStr = 'scale (' + zoomLevel + ')'
    thetreeG.transition()
        .duration(zoomSettings.duration)
        .ease(zoomSettings.ease) 
        .attr('transform', scaleStr)
    ;
   
} // end ZoomOutTree()


// The following is an example to get html contents from URL, and save as a treeJason file
function getHtmlAsTreeJSON(){

    /* to get text from a URL and change it into a JSON obj
    data is from https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12
    the contents are components after the h1 dom elements: CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.
    There are two types of ele: <p> and <pre>, each for normal text, and proverbs in french.
    */

    //1. fetch the dom from the url
    // to solve the cors problem !!! must have
    //https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
    var ExternalURL = "https://cors-anywhere.herokuapp.com/https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12"

    var thehtmlstr;var textDOMEles;
    $.ajax(ExternalURL, {
        success: function(data) {
            $('#tmpbox').html($(data).find('#tmpbox *'));
            console.log('The page has been successfully loaded');
            setTimeout (function (){
                // console.log(thehtmlstr)
                //parse html str as DOM elements
                textDOMEles =  $.parseHTML( thehtmlstr )
                // console.log(textDOMEles)
                // get the elments after the h1/'CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.'
                var startCatching=0, textArray=[];
                //find the h2 with text 'CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.'
                i=0
                textDOMEles.forEach(elm=>{
                    if ($(elm).is('h1') && $(elm).text().includes('CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.')  ){ //
                        startCatching=1
                        // console.log($(elm).text())
                    }                             
                    //after startCatching = 1, catch contents in <p>, and <pre>
                    if (startCatching===1 && ($(elm).is('p') || $(elm).is('pre'))) {

                        var thetxt = $(elm).text().trim()
                        //split the text by period. This is to have sentences at large.
                        var thetxtArr = thetxt.split('.')
                        thetxtArr.forEach(d=>{
                            tmpnode={
                                'idx': generateUUID(), 
                                'name': i++,
                                'NodeDescription': '///t <br />' + d + '.<br /> t///'
                            }
                            textArray.push(tmpnode)
                        })
                    }
                })
                // console.log(textArray)

                //finally, rep textArray will a parent node
                var thebook=[{
                    'idx':generateUUID(), 
                    'name': 'chapter12',
                    'children': textArray
                }]
                // console.log(thebook)

                NewTree(thebook)



                }, 3000
            );
            thehtmlstr=data;
        },
        error: function() {
            console.log('An error occurred');
        }
    });

}

// The following is an example to get text contents from URL, and save as a treeJason file
function getTextAsTreeJSON(){

    /* to get text from a URL and change it into a JSON obj
    data is from https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12
    the contents are components after the h1 dom elements: CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.
    There are two types of ele: <p> and <pre>, each for normal text, and proverbs in french.
    */

    //1. fetch the dom from the url
    // to solve the cors problem
    //https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
    var ExternalURL = "data/chapter12.txt"

    var thehtmlstr;var textDOMEles;
    $.ajax(ExternalURL, {
        success: function(data) {
            // $('#tmpbox').html($(data).find('#tmpbox *'));
            console.log('The page has been successfully loaded');
            setTimeout (function (){
                    thehtmlstr=data
                    console.log(thehtmlstr)
                    textArray=thehtmlstr.split('—');
                    var i=0; var nodesarray=[];
                    textArray.forEach(d=>{
                                tmpnode={
                                    'idx': generateUUID(), 
                                    'name': i++,
                                    'NodeDescription': '///t <br />' + d + '<br /> t///'
                                }
                                nodesarray.push(tmpnode)
                    })
                    // console.log(textArray)

                    //finally, rep textArray will a parent node
                    var thebook=[{
                        'idx':generateUUID(), 
                        'name': 'chapter12',
                        'children': nodesarray
                    }]
                    console.log(thebook)
                    NewTree(thebook)
                }, 3000
            );
        },
        error: function() {
            console.log('An error occurred');
        }
    });
}


/**The following is related to handling egp to treeJSON *******************/

/* a function to save File (similar to saveData (which is for saving JSON), but no need to stringfi the content*/
var saveFile = (function () {
    /*In the function, create an invisible element, which is a hyperlink named 'a'*/
    var a = document.createElement("a");
    /*in the body section of the current document, create a child element, with a tag name of 'a' (in html, those tagged 'a' is for hyperlink*/
    document.body.appendChild(a);
    /*make it invisible*/
    a.style = "display: none";
    /*the next is to return strings from the second function as command lines.
        for the second function, the parameters 'data' and 'filename' are from the first function*/
    return function (srcfilecontent, fileName) {
        /*create a blob object
            a blob is a file like object.
            https://developer.mozilla.org/en-US/docs/Web/API/Blob
            make it a binary type (octet/strem)
        */
        blob = new Blob([srcfilecontent], {type: "octet/stream"}),
        // blob = new Blob([srcfilecontent], {type: "mime"}),
        // blob = new Blob([srcfilecontent])
        /*Pop up a window, for saving the created blob object*/
        url = window.URL.createObjectURL(blob);
        
        /*make the link of the a element as the url*/
        a.href = url;
        /*set the name of the downloaded file*/
        a.download = fileName;
        /*click to go to the url, i.e., to open the SavaAs window*/
        a.click();
        /*display the savaAs window*/
        window.URL.revokeObjectURL(url);
        };
}());

// from a local egp file (or any zip files)
function ImportFromEGPAfterReloading(d){

    //initialize the root parent
    var therootparent;

    // console.log(d)
    //https://stackoverflow.com/questions/32267930/get-name-of-files-of-zip-file-in-javascript
    var thezipfile =d.files[0];

    var reader = new FileReader();
    reader.readAsBinaryString(thezipfile);

    reader.onloadend = function(e){
        var myZip = e.target.result;                 
        var unzipper = new JSUnzip(myZip);

        unzipper.readEntries();
        
        //myFiles, or the entries contains a flatterned list of files, in which
            // the .fileName contains filePath and fileName in the
        var myFiles = unzipper.entries;    

        for(var i=0; i<myFiles.length; i++) {

            var name = myFiles[i].fileName; // This is the file name
            // console.log( myFiles[i].fileName)
            
            //find the file 'project.xml' and extract its content as html DOM
            if (name === 'project.xml'){

                var content = JSInflate.inflate(myFiles[i].data); // this is the content of the files within the zip file.
                
                //remove the non printable characters (indeed the non ascII chars)
                var rcontent = content.replace(/[^\x20-\x7E]/g, ''); //!!!! must have, as the original content contains non-printable characters which cause error when transferrring to html DOM
                //replace \ with \_. This is to prevent errors caused by backslash
                rcontent = rcontent.replace(/\\/g, '\\_') ;

                //The xml sucks, instead, import the rcontent str as HTMLDOM
                var htmlDoc=$.parseHTML( rcontent )
                // console.log($(htmlDoc)) // the node 'projectcollection' contains all relavant info

                htmlDoc.forEach(elm=>{
                    if ($(elm).is('Projectcollection')) {
                        // console.log($(elm))
                        // console.log($(elm).children())
                        // var projectDoc=$(elm)
                        // console.log(projectDoc.children().length)

                        //0) determine the root parent, which is the ProjectCollection
                        //idx
                            var rootidx = elm.getElementsByTagName("ID")[0].innerHTML
                        //name
                            var rootname = elm.getElementsByTagName("Label")[0].innerHTML
                        //type
                            var roottype = elm.getElementsByTagName("Type")[0].innerHTML

                        therootparent = {
                            "idx": rootidx,
                            "name": rootname,
                            "type": roottype,
                            "children": []
                        }
                        // console.log(therootparent)
                        
                        //1) push the task related items into an array, each item in the target array contains
                        // idx (the unique id given by SAS egp), name (from <label>), and type (from <type>)
                        var tasksarray_nocode = egpTasksToArray(elm) // the input is the DOM element, not the $(elm), ie., not the JQuerry object
                        // console.log(tasksarray)
                        
                        //1a) for each task, get their contents from a file of the same id in the egp zip (a file in myFiles)
                        var tasksarray = getTaskContents(tasksarray_nocode, myFiles)
                        
                        //2) get a collection of links
                        var linksarray_all = egpLinksToArray(elm)
                        // console.log ('all links including those not to interested tasks')
                        // console.log(linksarray_all)
                        /*2a) !!! must have
                            hold on, some links, either the .to or .from are of an idx that cannot be found in tasksarray
                            Probably, taskarray only contains the interested tasks (type = task, etc)
                            There are other items that a link is from or to, but these items are not included in taskarray
                            So within linksarray, we need to remove those not to/from a task in taskarray
                        */
                        var linksarray = getLinksToTasks(tasksarray, linksarray_all)
                        // console.log(linksarray)
                        //2b) determine the default links, and the customized links
                        var splitArrays = getDefaultCustLinks(linksarray)
                        var defaultlinksarray = splitArrays.defaultlinks;
                        var custlinksarray =  splitArrays.custlinks;
                        // console.log(defaultlinksarray)
                        // console.log(custlinksarray)

                        //3) for each task, determine .children .custparents
                        therootparent = getTaskChildrenCustparents(tasksarray,defaultlinksarray,custlinksarray,therootparent);
                        console.log(therootparent)

                        //To this step, the treeJSON is ready, which is therootparent! Make a tree with therootparent
                        NewTree(therootparent)

                        // do not delete
                        // for (i=0; i < projectDoc.children().length;i++ ){ // .forEach does not work!

                        //     // console.log($(f))
                        // }
                    }
                })

                // var projectDoc=$(htmlDoc).projectcollection;
                // console.log($(projectDoc))

                
                // save file to local drivers. DO NOT Delete
                //saveFile(rcontent, 'newFile.xml')

            } // end if (name === ...)
        } // end for myfiles loop
    } // end reader.onload =...

    

} // End ImportFromEGPAfterReloading

// from all links, select those to and from a task
function getLinksToTasks(tasksarray, all_links){
    // get an array of idx from tasksarray
    var idx_array_tasks = tasksarray.map(obj=>obj.idx)
    // console.log(idx_array_tasks)
    var theLinksToTasks=[]; // Note!!!! do not use splice(i,1) It'll mess up the order of the items in the array
    // instead, create a new array and add qualified items into the new array

    all_links.forEach((al,i)=>{
           // if the to/from idx of the current link cannot be found in idx_array_tasks, delete the link
        if (  idx_array_tasks.indexOf(al.to) === -1 || idx_array_tasks.indexOf(al.from) === -1 ){
            // console.log('the following link is not to/from a task and is deleted')
            // console.log(al)
        }  else {
            theLinksToTasks.push(all_links[i]) 
        }      
    })
    // console.log(theLinksToTasks.length)
    return theLinksToTasks
}



/**For each task in taskarray, determine .childrens, and .custparents */
function getTaskChildrenCustparents(tasksarray,defaultlinksarray,custlinksarray,therootparent){
    // console.log(tasksarray)
    //Part 1: loop for each task in tasksarray:
    tasksarray.forEach(t=>{
        t.children =[], t.custparents =[];
        /**The following is to determine .children, .custparents, and .bornparent*/

        // A. loop for each defaultlink item to determine the bornparent, and the children of the current task
        defaultlinksarray.forEach((dl, i)=>{

            /* 1) to determine .bornparent:
            *  a. loop for the defaultlinksarray for idx in '.to' as the same as t.idx
            *      such a link from defaultlinksarray tells that the current task is a child in that link
            *  b. for the link identified in step a., the idx in '.from' is the idx of the bornparent of the current task
            *  c. now the tricky part. Using the idx determined in b, we'll need to find the
            *       item in task that is of the same idx, and save that task item as the .bornparent 
            *       of the current task. 
            *       We cannot directly save the idx found in b as the .bornparent, as we'll need .bornparent 
            *       to be an obj having all properties of that parent task (i.e., idx, name, and type), not only the idx 
            * Note: for each task, there is 0 or 1 link item that can be found by step a.
            */
            if (t.idx === dl.to){
                // get an array of idx from tasksarray
                var idx_array_tasks = tasksarray.map(obj=>obj.idx)
                // console.log(idx_array_tasks)

                //get the index number of the item in idx_array_tasks, and with the idx value equals to dl.from
                var IndexNumber_idxInTaskMatchingDLFrom = idx_array_tasks.indexOf(dl.from)
                // console.log(IndexNumber_idxInTaskMatchingDLFrom)

                //use the index number above, get the corresponding item in taskarray. This is the item with the same idx matching the idx in dl.from
                t.bornparent = tasksarray[IndexNumber_idxInTaskMatchingDLFrom] 
                
                // Duhh, a more succinct way is the following:
                //t.bornparent = tasksarray[tasksarray.map(obj=>obj.idx).indexOf(dl.from)]

                // console.log('t.idx, dl.to, dl.from, and t.bornparent: ============')
                // console.log(t.idx)
                // console.log(dl.to)
                // console.log(dl.from)
                // console.log(t.bornparent)
            }

            /* 2) to determine .children:
            *  a. loop for the defaultlinksarray and find the item with the idx in '.from' as the same as t.idx
            *      such a link from defaultlinksarray tells that the current task has a child in that link
            *  b. for the link identified in step a., the idx in '.to' is the idx of a child of the current task
            *  c. now the tricky part. Within the idx determined in b, we'll need to find the
            *       item in task that is of the same idx, and push that task item as a child in 
            *        t.children (of the current task). 
            *       We cannot push the idx found directly into t.children, as we'll need .children 
            *       to have objs with all properties of that child task (i.e., idx, name, and type), 
            *       not only the idx             * 
            * Note: for each task, there could be multiple link item that can be found by step a.
            */
           if (t.idx === dl.from){
                
                //use the idx in dl.to of the current dl, get the corresponding item in taskarray. 
                //This is the task which is a child of the current t                
                var thechildtask = tasksarray[tasksarray.map(obj=>obj.idx).indexOf(dl.to)]
                // the DOM from egp is quite messed up. sometimes a .to idx in a link cannot be matched 
                    // to idx of any task
                if (thechildtask === undefined) {
                    console.log('hey something is wrong !!!' + i)
                    console.log(t)
                    console.log(dl)
                } else{
                    // push the child task into t.children
                    t.children.push(thechildtask)
                }                
           }

        })
        // B. loop for each custlinksarray item to determine the idx (this time, idx only) of a custparent
        custlinksarray.forEach(cl=>{

            /* 1) to determine .custparent:
            *  a. loop for the custlinksarray for idx in '.to' as the same as t.idx
            *      such a link from custlinksarray tells that the current task is a child in that link
            *  b. for the link identified in step a., the idx in '.from' is the idx of a custparent of the current task
            *  c. push the idx found in b into t.custparents. .custparents is an array of idx. 
            *       Unlike .bornparent, or .children, .custparents only contain idx, no other properties are required
            * Note: for each task, there is multiple item that can be found by step a.
            */
           if (t.idx === cl.to){            
                // push dl.from into t.custparients
                t.custparents.push({"idx": cl.from})
            }            
        })
    })


    /** Part 2. Now for those task items which do not have .parent, link them to the root parent 
     * (which is prepared in ImportFromEGPAfterReloading). The root parent has the idx of the 
     * projectcollection 
     * This has to be done after part 1. Although it seems that it repeats the same loop for each task,
     *  this time each tasks has been exhaustive on its .parent.
     * Those tasks without a parent node are truly not having a parent in the links. Only for these tasks it
     *  is proper to add the root parent as their .parent 
     * 
    */
   tasksarray.forEach(t=>{
        if (t.bornparent === null || t.bornparent === undefined) {
            /**Well, indeed it is rather pushing the task into root.children
             * As in d3 tree, the interests are in .children, not .parent
            */
           therootparent.children.push(t)
        } else {
            delete t.bornparent 
            /*Yes. The only purpose for .bornparent is to identify whether a task should be linked to the 
                root parent. For those alreay have a bornparent, their relationship with the parent has been
                defined in their parent task's .children. So the .bornparent here is redundant, and should be removed
            */
        }
        /**also, delete .children if it is [], delete .custparent if it is [] */
        // if (t.children===undefined || t.children === null ){t.children =[] }
        if (t.children.length ===0 ){delete t.children}
        if (t.custparents.length===0){delete t.custparents}
   })

//    console.log(therootparent)
   return therootparent;

}

/**determine the default and customized links
 * 1) sort the links by their '.to' field
 * 2) get an array of the first item with distinct '.to' values (these are the distinct task nodes
 *         and the .from is the parent). This array is for default links
 * 3) for items not of the first, put them in another array, which is for customized links
 */
function getDefaultCustLinks(srclinks){
    var theDefaultlinks=[], theCustlinks=[];
    var last_linkto;
    
    // sort the links by .to field
    srclinks.sort(function(a,b){
        var textA=a.to.toUpperCase();
        var textB=b.to.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        })
        
    //split the links into default links, and customized links.
    // The allocation of default/customized links are quite arbituary, but it does not matter, as the
        // relationship of these nodes can be changed in the tree map. 
    srclinks.forEach(function(d){
		//if the linkto is the same as the previous, add it to the customized links array
		if (d.to === last_linkto){
			theCustlinks.push(d);			
		} else{
			//if the linkto is new, add it to the default links array
			theDefaultlinks.push(d);
			last_linkto= d.to;
		}
	})
    
    // return {'defaultlinks': theDefaultlinks,'custlinks': theCustlinks} 
    return {'defaultlinks': theDefaultlinks,'custlinks': srclinks} 
    // changed, the default links array contains the first link for .to node, 
    //but the custlink array contains all links! That way, later when changing parent in tree map, 
    //none of the existing relationship will be lost
}

function egpLinksToArray(theDom){
	
    var ProjectCollectionElements= theDom.getElementsByTagName("Element"); //[0].children;

// console.log(ProjectCollectionElements)	
    
    //get the elements as a d3 array, each for an element 
    var ProjectCollectionLinks=[];
    var eleLength = ProjectCollectionElements.length;
    var i=0;
    while (i < eleLength) {
        //get the element's type
        theElement=ProjectCollectionElements[i];
            var theEleType = d3.select(theElement).attr("Type");
//console.log(theEleType);
            if (theEleType === "SAS.EG.ProjectElements.Link"){
                //display label
                // console.log(theElement.children[0].children[0].innerHTML)

                //get the theLinkLogs
                var theLinkLogs = theElement.getElementsByTagName("Log")[0];
//console.log(theLinkLogs)
                //get LinkedFrom TaskID
                var theLinkedFromTaskID =theLinkLogs.getElementsByTagName("LinkFrom")[0].innerHTML; //Label, the index number may change
//console.log(theLinkedFromTaskID)
                var theLinkedToTaskID =theLinkLogs.getElementsByTagName("LinkTo")[0].innerHTML; //ID, the number may change
//console.log(theLinkedToTaskID)
                var theLink = {from:theLinkedFromTaskID, to:theLinkedToTaskID};
                ProjectCollectionLinks.push(theLink);
            }
        i++;			
    };
//console.log(ProjectCollectionLinks)
    return ProjectCollectionLinks;	
}

/*get task related information from the messy EGP dom. The intereted output includes tasks, EGTask, and Note
  Note: The relationship of these items (who's the parent, who's the chidren, etc) will be determined by the links in a separate function
*/
function egpTasksToArray(theDom){
	
    // console.log (theDom)
    
    //get the project collection elements (tasks, note, etc.)
    // these elements are wrapped in the dom element <Elements></Elements>
    //var ProjectCollectionElements=d3.select(ProjectCollection.children[11].children)[0][0];//the index number 11 may change ... so better to get Elements by TagName
    var ProjectCollectionElements= theDom.getElementsByTagName("Elements")[0].children;

//console.log(ProjectCollectionElements)	
    
    //get the elements as a array, each for an element 
    var ProjectCollectionTasks=[];
    var eleLength = ProjectCollectionElements.length;
    var i=0;
    while (i < eleLength) {
        //get the element's type
        theElement=ProjectCollectionElements[i];
            var theEleType = d3.select(theElement).attr("Type");
//console.log(theEleType);
            if (theEleType === "SAS.EG.ProjectElements.CodeTask"
                ||
                theEleType === "SAS.EG.ProjectElements.EGTask"
                ||
                theEleType === "SAS.EG.ProjectElements.Note"
            ){
            /**Note!!!! both shortcuts and tasks have the same type: Task
             * However, they can be differentiated by <Element>.<CodeTask>.<Embedded>. 
             * If the text within <Embedded> is True, it is a task; if 'False', a shortcut.
             * For shortcuts, <Element>.<CodeTask>.<DNA> contains properties of the source of shortcut
             * including (for example, for the source of a .sas file) the name, the FullPath, etc
             */
                // console.log(theElement)
                //get the theTaskProperties
                var theTaskProperties = theElement.children[0];
//console.log(theTaskProperties)
                //get theTaskLabel
                var theTaskLabel =theTaskProperties.getElementsByTagName("Label")[0].innerHTML; //Label, the index number may change
//console.log(theTaskLabel)
                var theTaskID =theTaskProperties.getElementsByTagName("ID")[0].innerHTML; //ID, the number may change
//console.log(theTaskID)
                var theTaskType = theTaskProperties.getElementsByTagName("Type")[0].innerHTML;

                //If the task is a note, its contents are within the tag
                if (theTaskType === "NOTE"){
                    theNoteContent = theElement.getElementsByTagName("Text")[0].innerHTML;
                    var theNoteContent1 = theNoteContent.replace(/\r\n|\r|\n/gm, '<br />') // must have, replace line break with html linebreaker symbols
                    var theNoteContent2 =theNoteContent1.replace(/(&lt;)/g, '<')
                    var theNoteContent3 = theNoteContent2.replace(/(&gt;)/g, ">")
                    var theNoteContent4 = theNoteContent3.replace(/ /g, "&nbsp")
                    var theNoteContent5 = theNoteContent4.replace(/\t/gm, '&nbsp&nbsp&nbsp&nbsp')
                    var theNoteContent6 = '///t<br />' + theNoteContent5 + '<br />t///'
                    console.log('theNoteContent')
                    console.log(theNoteContent)
                    console.log(theNoteContent6)
                    var theTask = {idx:theTaskID, name:theTaskLabel, type:theTaskType,
                                    NodeDescription:theNoteContent6 };
                } else {
                    var theTask = {idx:theTaskID, name:theTaskLabel, type:theTaskType};
                }                
                ProjectCollectionTasks.push(theTask);
            }
        i++;			
    };

    //console.log(ProjectCollectionTasks)
    return ProjectCollectionTasks;	
} // end egpTasksToArray



// to get contents (e.g., sas code, comments) from the egp zip
// the srcarray should contain idx, name, and type of the task
function getTaskContents(srcarray, filesInZip){

    srcarray.forEach(d=>{
        /** in SAS egp, a task file (usually called a program) contains SAS code and 
         * comments of the task. both the task content file, and the task itself shares the same id.
         * specifically, the task file in the epg zip is named by the following rules:
         * <id of the task> + '/code.sas'
         * determine the file with contents of the task */
        theidx = d.idx
        // so the content file is:
        thesascodefiletosearch = theidx + '/code.sas'

        //loop for each file in filesInZip see if there is a matched file
        for(var i=0; i< filesInZip.length; i++) {
            var thefilename = filesInZip[i].fileName; // This is the file name
            if (thefilename === thesascodefiletosearch) {
                // console.log('matched file found ============')
                // console.log(thefilename)
                var content = JSInflate.inflate(filesInZip[i].data);
                var rcontent1 = content.substring(1,2)
                //the first 2 char are often non-printable characters. If so, delete them
                var rcontent1a = rcontent1.replace(/[^ -~]+/g, ''); //!!!! must have
                var rcontent2a = content.substring(3).replace(/\r\n|\r|\n/gm, '<br />') // must have, replace line break with html linebreaker symbols
                var rcontent2b = rcontent2a.replace(/\t/gm, '&nbsp&nbsp&nbsp&nbsp')
                var rcontent= rcontent1a + rcontent2b
                console.log(rcontent)
                d.NodeDescription = '///t<br />///s<br />' + rcontent + '<br />s///<br />t///'
            }
        } // end for loop

    })
    // console.log(srcarray)
    return srcarray
} // end of getTaskContents

/**The above is related to handling egp to treeJSON *******************/


/**The following is to resize of treeviewbox, and  textviewbox (tested, works for chrome, and firefox)*/
function observetreeviewboxsize(){
    //when the treeviewbox changed, check it's size
    //https://alligator.io/js/resize-observer/
    const myObserver = new ResizeObserver(entries => {
        // iterate over the entries, do something.
        entries.forEach(entry => {

            //update the textviewbox, svg size, and the rect size
            width_textviewbox = entry.contentRect.width
            height_textviewbox = entry.contentRect.height
            svgwidth = width_treeviewbox - borderweight_viewbox *2; 
            svgheight = height_treeviewbox - borderweight_viewbox*2;

            //update the size of the svg
            svg.attrs({
                'width': entry.contentRect.width- borderweight_viewbox *2, // note: it does not word here to use 'svgwidth'. Maybe it is not updated yet
                'height':entry.contentRect.height - borderweight_viewbox*2
            })
            thetreerect.attrs({
                'width': entry.contentRect.width- borderweight_viewbox *2,
                'height':entry.contentRect.height - borderweight_viewbox*2
            })

            });
    });
    const elmsToObserve = document.querySelector('.treeviewbox');      
    myObserver.observe(elmsToObserve);
}
// the following is not used as it is not necessary
function observetextvewboxsize(){
    //when the treeviewbox changed, check it's size
    //https://alligator.io/js/resize-observer/
    const myObserver = new ResizeObserver(entries => {
        // iterate over the entries, do something.
        entries.forEach(entry => {

            //update the textviewbox, svg size, and the rect size
            width_textviewbox = entry.contentRect.width
            height_textviewbox = entry.contentRect.height

            });
    });
    const elmsToObserve = document.querySelector('.textviewbox');      
    myObserver.observe(elmsToObserve);
}

/**The above is to resize of treeviewbox, and  textviewbox (tested, works for chrome, and firefox)*/