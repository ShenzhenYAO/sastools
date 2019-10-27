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

/**B make a new tree */
NewTree(treeData)




