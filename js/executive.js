//change from d3v3 to d3v4 can be found at
//https://github.com/d3/d3/blob/master/CHANGES.md		
//http://bl.ocks.org/d3noob/8375092


/*********************************************************************************** 
 * Note: the following only works in Google Chrome.
 * In firefox, the index page is constantly refreshing
 * The solution is: 
 *          Use Chrome!
 ***********************************************************************************/

// 0.1 Add title and description
addtitledesc();

//0.2 add two boxes
var bodyd3=d3.select('body');
var bigdiv= bodyd3.append('div')
.attr('class', 'bigdiv')
.styles({
    'width':(width_body) + 'px',
    'height':height_body + 'px',
    'float':'left',
    'border-width': borderweight_viewbox + 'px'
    // 'white-space':'nowrap' // to prevent wrap, but seems unecessary
})
var textviewbox=bigdiv.append('div')
    .attr('class', 'textviewbox')
    .styles({
        'width':(width_textviewbox) + 'px',
        'height':height_body + 'px',
        'float':'left',
        'border-style':'solid',
        'border-width': borderweight_viewbox + 'px'
    })
    // .text('div1')
var treeviewbox = bigdiv.append('div')
    .attr('class', 'treeviewbox')
    .styles({
        'width':(width_treeviewbox) + 'px',
        'height':height_body + 'px',
        'float':'left',
        'border-style':'solid',
        'border-width': '1px'
    })
    // .text('div2')



/**0.3 Add a svg, tree rect, and treeg in body **********************************/

/**0.3.1.1 determine the svg */
// var svgwidth = width_tree + TreeMarginToSvg.left + TreeMarginToSvg.right,
//     svgheight = height_tree + TreeMarginToSvg.top + TreeMarginToSvg.bottom
//     ; // by tree size
// svgwidth = Math.max(svgwidth, width_treeviewbox); // the tree size or the viewbox size, which ever is larger
// svgheight = Math.max(svgheight, height_treeviewbox);

// modified! do not change the svg and the rect's size
svgwidth = width_treeviewbox - borderweight_viewbox *2; 
svgheight = height_treeviewbox - borderweight_viewbox*2;

var svg = addnewEle(svgwidth, svgheight, null, 'thebigsvg', treeviewbox, null, 'svg', null );

/**0.3.1.2 add a mouse position tip. Note: not used as it isjsut for illustration */
// This trick is learned from https://github.com/Matt-Dionis/d3-map
// var themousepositiontip = svg.append('g')
//     .attr('class', 'mousepositiontip')
// var mousetiptext=themousepositiontip.append('text')
//     .attr('class', 'mousepositiontiptext')
//     .style('opacity', '0')
// ;



/**0.3.1.3 enable zooming and pan, from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box
 * Note: not used because of its poor performance
*/
// svg.call(
//     d3.zoom()
//         .scaleExtent([1 / 2, 12])
//         .on("zoom", zoomed) 
// )


/**0.3.2, append a rect to allow click on blank. From F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box */
//insert a rect, so that we can click on the blank area, to zoom out
var thetreerect=svg.append('rect')
    .attrs({
    'class': 'treerect',
    'width': svgwidth,
    'height': svgheight,
    'id': 'I created'
    // 'stroke': 'black'
    })
    // .style('pointer-events', 'all')
    // .classed ('background', true)
    .on('contextmenu', ZoomInOutSelectedNode)
    // on mouse over, show mouse position
    // .on('mouseover', showmouseposition)
; 


/**0.3.3 Add a g in svg */
var transfm= "translate(" + TreeMarginToSvg.left + "," + TreeMarginToSvg.top + ")";
var thetreeG = addnewEle(null, null, null, 'thetreeg', svg, null, 'g', transfm );
//!!!! here thetreeG.on('mousedown') does not work
// thetreeG.on('mousedown', pan)



/**A. load tree Data as a json obj from an external json file 
 * Note: getJsonFromsessionStorage is results from a IFFE function getting results from sessionStorage items.
 * Such arrangement solves asynchronous issues (i.e., treeJSON does not waiting for d3.json(), and carries on with null). 
*/
treeData = getJsonFromsessionStorage;
// console.log('show treeJSON =======')
/**check if treeJSON is an Array ([..]). If so, change it to a JSON like obj ({...}) */
if (Array.isArray(treeData)){
    treeJSON = treeData[0];
} else {
    treeJSON = treeData;
}
//console.log(treeJSON)


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
rootdatapoint= d3.hierarchy(treeJSON, function(d) { return d.children; }); //v4


/**B.1.2 calculate the number of columns and rows based on the datapoints in rootdatapoint
 * https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
*/
var flatterneddatapoints_sortedrowscols;
var proposedTreesize = estTreesize(rootdatapoint)
// console.log('the estimated tree size ()')
// console.log(width_tree, height_tree)

//Note!!! the function estTreesize() must stay in executive.js, as it will be used in executive.js. It should not be moved to components.js, as components.js has not be loaded when executive.js is running
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
var treeinstance; // important: treeinstance has to be defined outside the function
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
    
    var updateTree = MakeChangeTree(rootdatapoint_sortedrowscols);
    // console.log('updateTree ==================')
    // console.log(updateTree)
    var offsetshiftup= TreeMarginToSvg.top;
}

/**C. Enable panning (press and hold mouse to move the tree within the svg/treerect)  */
pan();

/**add customized links */
custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate ); // add cross link, it should be separate from

// the following shows the realy tree size after waiting for all jobs are done
setTimeout (function (){
    // console.log('treesize after wait')
    // console.log(thetreeG.node().getBoundingClientRect())
    // console.log(rootdatapoint_sortedrowscols)
    }, 3000
);

// the following shows the initial tree size before all jobs are done
// console.log('treesize without wait')
// console.log(thetreeG.node().getBoundingClientRect())
// the x, y , however, are always the values after all jobs are done. 
// console.log(rootdatapoint_sortedrowscols)



