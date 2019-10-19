//change from d3v3 to d3v4 can be found at
//https://github.com/d3/d3/blob/master/CHANGES.md		
//http://bl.ocks.org/d3noob/8375092


/*********************************************************************************** 
 * Note: the following only works in Google Chrome.
 * In firefox, the index page is constantly refreshing
 * The solution is: 
 *          Use Chrome!
 ***********************************************************************************/

// 0. Add title and description
addtitledesc();

/**A. load tree Data as a json obj from an external json file 
 * Note: getJsonFromSessionStorage is results from a IFFE function getting results from sessionStorage items.
 * Such arrangement solves asynchronous issues (i.e., treeData does not waiting for d3.json(), and carries on with null). 
*/
treeData = getJsonFromSessionStorage;
// console.log('show treedata =======')
// console.log(treeData)

/**B. Add tree ************************************************/
/**B.1.1 Add a svg in body **********************************/
var svgwidth = width_body,
    svgheight =height_body
    ;
var svg = addnewEle(svgwidth, svgheight, null, null, null, 'body', 'svg', null );

/**B.1.2 enable zooming and pan, from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box*/
svg.call(
    d3.zoom()
        .scaleExtent([1 / 2, 12])
        .on("zoom", zoomed) 
)
/**B.1.3, append a rect to allow click on blank. From F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box */
//insert a rect, so that we can click on the blank area, to zoom out
svg.append('rect')
    .attrs({
    'class': 'background',
    'width': width_body,
    'height': height_body,
    'id': 'I created',
    'stroke': 'black'
    })
    // .classed ('background', true)
    .on('contextmenu', click2); 

/**B.2 Add a g in svg */
var transfm= "translate(" + margin.left + "," + margin.top + ")";
var g = addnewEle(null, null, null, 'thebigg', svg, null, 'g', transfm );

/**B.3 Instanciate a tree class with height and width */
var treemap = d3.tree().size([height_tree, width_tree]);//d3v4

/**B.4 Define the root data*/
/******migration to D3V4 part 3*/
root = d3.hierarchy(treeData, function(d) { return d.children; }); //v4
/**B.4.2 add new properties (coordinates of the starting position) */
root.x0 = height_tree /2;
root.y0 = 0;

/*run the function 'update(source)' (source=root) */
update(root);




