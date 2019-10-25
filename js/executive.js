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
    'border-width': '1px'
    // 'white-space':'nowrap' // to prevent wrap, but seems unecessary
})
var textviewbox=bigdiv.append('div')
    .attr('class', 'textviewbox')
    .styles({
        'width':(width_textviewbox) + 'px',
        'height':height_body + 'px',
        'float':'left',
        'border-style':'solid',
        'border-width': '1px'
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


/**A. load tree Data as a json obj from an external json file 
 * Note: getJsonFromSessionStorage is results from a IFFE function getting results from sessionStorage items.
 * Such arrangement solves asynchronous issues (i.e., treeJSON does not waiting for d3.json(), and carries on with null). 
*/
treeData = getJsonFromSessionStorage;
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
/*B.1.2.1, flatten the data points, putting them in an array */
tmptreeinstance=d3.tree();
flatterneddatapoints =tmptreeinstance(rootdatapoint).descendants();

/**B.1.2.2 for each datapoint, get the sorted row and col number  */
flatterneddatapoints_sortedrowscols=getSortedRowsCols(flatterneddatapoints);

/**B.1.2.3 get the maxrows and cols */
var maxrowscols= getmaxrowscols(flatterneddatapoints_sortedrowscols)
// console.log(maxrowscols)

/**B.1.3 estimate the size of the tree
 * so, vertically the rows should be between_nodes_vertical apart from each other
 * horizontally, between_nodes_horizontal apart from each other
 * These parameters (between_nodes_vertical, ...) are defined in init.js
 * the width_tree should be (maxrows -1) * between_nodes_vertical plus padding (margin to top and bottom)
 * the height_tree should be (maxcols -1) * between_nodes_horizontal plus padding (margin to left and right)
 */

// one can never get the right paddings with the stupid design of d3.tree
height_tree = maxrowscols[0] * between_nodes_vertical; // this will put rows with paddings of half the between_nodes_vertical top and bottom
width_tree = maxrowscols[1] * between_nodes_horizontal;


/**B.1.4 
 * Now how to make the flatterned back to hierarchical structure?
 * d3.stratify()..., or, 
 * Do not have to, as the first element is with its descendants, i.e., in hierarchical structure!
*/
rootdatapoint_sortedrowscols = flatterneddatapoints_sortedrowscols[0];

/**B.1.5 add new properties (coordinates of the starting position) */
rootdatapoint_sortedrowscols.x0 = height_tree /2;
rootdatapoint_sortedrowscols.y0 = 0;
rootdatapoint.x0= height_tree /2;;
rootdatapoint.y0=0;
// console.log(rootdatapoint)
// console.log(rootdatapoint_sortedrowscols)


/**B.2.1 Add a svg in body **********************************/

/**B.2.1.1 determine the svg */
var svgwidth = width_tree + TreeMarginToSvg.left + TreeMarginToSvg.right,
    svgheight = height_tree + TreeMarginToSvg.top + TreeMarginToSvg.bottom
    ; // by tree size
svgwidth = Math.max(svgwidth, width_treeviewbox); // the tree size or the viewbox size, which ever is larger
svgheight = Math.max(svgheight, height_treeviewbox);

var svg = addnewEle(svgwidth, svgheight, null, 'thebigsvg', treeviewbox, null, 'svg', null );

/**B.2.1.2 add a mouse position tip */
// This trick is learned from https://github.com/Matt-Dionis/d3-map
// var themousepositiontip = svg.append('g')
//     .attr('class', 'mousepositiontip')
// var mousetiptext=themousepositiontip.append('text')
//     .attr('class', 'mousepositiontiptext')
//     .style('opacity', '0')
// ;


/**B.2.2 enable zooming and pan, from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box*/
// svg.call(
//     d3.zoom()
//         .scaleExtent([1 / 2, 12])
//         .on("zoom", zoomed) 
// )
/**B.2.3, append a rect to allow click on blank. From F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box */
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


/**B.3 Add a g in svg */
var transfm= "translate(" + TreeMarginToSvg.left + "," + TreeMarginToSvg.top + ")";
var thetreeG = addnewEle(null, null, null, 'thetreeg', svg, null, 'g', transfm );
//!!!! here thetreeG.on('mousedown') does not work
// thetreeG.on('mousedown', pan)


/**B.4 make a new tree */
var treeinstance; // important: treeinstance has to be defined outside the function
// according to the selected method, make a new tree
if (newtreeMethod === 'bynodesize') {
    // use the newtree_offsetNodeSizeMethodShiftError to make new tree, make adjustment and get the offset distance for zooming ()
    var offsetshiftup = newtree_offsetNodeSizeMethodShiftError().offsetshiftup;
} else {
    treeinstance = d3.tree().size([height_tree, width_tree]); // don't put it inside MakeChangeTree, as the bynodessize () method requires a different line (.nodeSize() instead of .size())
    // do not use the newtree_offsetNodeSizeMethodShiftError(), create the tree directly, not to adjust (no need) offset errors as nodeSize() method is not used
    MakeChangeTree(rootdatapoint_sortedrowscols);
    var offsetshiftup= TreeMarginToSvg.top;
}

/**C. Enable panning (press and hold mouse to move the tree within the svg/treerect)  */
pan();

