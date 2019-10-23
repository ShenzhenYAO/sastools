/**initiation and settings */

/**javascript is sometimes stupid and awkward.
 * 
 * For example, to make programs well arranged, the files should be arrange as that:
 * 1. a master or executive js is loaded by index.html. The master js file only contains pithy lines. 
 * (e.g., 
 *  addtitledesc(); 
 *  loadjson(); etc
 * )
 *       
 * 2. components to run in the executive (e.g. function addtitledesc(){...}, function loadjson(){..}) are saved in a 
 * separated file (e.g. components.js)
 * 
 * Ideally components.js should be loaded by the executive.js. However, loading an external js into the current js 
 * is complicated; therefore js files are usually all loaded in the index.html. In the above example, the
 * components.js should be loaded first, followed by the executive.js. If the executive.js were loaded in the first
 * place, the system won't know what to refer to for components like addtitledesc().
 * 
 * Now the question is: where shall the initial settings (e.g., var treejosnURL='data/Treedata.json') be placed?
 * They should not be placed in the components.js, as it is sort of high-level or executive settings, whereas components.js
 *  is supposed to contain individual models. 
 * Nor should they be placed into the executive.js, as they must be defined prior to loading of the components.js. 
 * 
 *  
 * Things could be hairwire for such bad design of javascript. In this example, one has to make shift and add
 *  another js file (e.g., init.js) to hold such initial settings. 
 * 
 * As such, a simple task like this will cost 3 inidividual js files. Now I understand why packages like 
 *  Angular is so complicated. It has to be, as javascript is, like I said, stupid and awkward! 
 *
 * JS structure in this project (100B02) is exactly the victim of such bad design. Three js files are loaded
 *  in index.html, namely init.js, components.js, and executive.js (in that order). The logic is 
 *  1) define vars and make settings in init.js
 *  2) define functions in components.js
 *  3) write lines to run functions in executive.js
 * /

/**global vars */
var 
    gitcommitversion = '12',

    treejsonURL = 'data/doctype.json',     // the url of the external json file with tree data
    treeData,   // to hold the tree data 
    treeJSON,   // to hold the tree JSON from treeData
    i = 0,  // no need
    showhidedescendants_duration = 1750,     //duration of transition (1000 = 1 second)
    rootdatapoint, //the root data point and its descendants in hierarchical structure
    flatterneddatapoints, // an array of flattered datapoints from rootdatapoint
    flatterneddatapoints_sortedrowscols, // adding sorted rows and cols (to be put in a tree) of points in flatterneddatapoints
    treemaxrowscols // the maxrows and cols in an array
   
;


/** for zooming and pan
 * from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box * 
*/
var w = window;
var doc = document;
var el = doc.documentElement;
var body = doc.getElementsByTagName('body')[0];
var width_body = w.innerWidth || el.clientWidth || body.clientWidth;
var height_body = w.innerHeight|| el.clientHeight|| body.clientHeight;
var centeredNode;
var zoomSettings = {
    duration: 1000,
    ease: d3.easeCubicOut, 
    zoomLevel: 2
  };

/**tree making method: size() or nodeSize() */
//https://stackoverflow.com/questions/17558649/d3-tree-layout-separation-between-nodes-using-nodesize
// tree().nodeSize() makes flexible size trees, tree().size() makes fixed-size trees. The two cannot be used at the same time
var newtreeMethod='bysize' //bynodesize or bysize


/*define the svg box and padding, and properties of the tree*/
var 
	TreeMarginToSvg = {top: 20, right: 120, bottom: 20, left: 120},
	// width_tree = width_body - TreeMarginToSvg.right - TreeMarginToSvg.left,
    // height_tree = height_body - TreeMarginToSvg.top - TreeMarginToSvg.bottom,
    width_tree,
    height_tree,
    between_nodes_horizontal = 180,
    between_nodes_vertical = 65,
    center_tree, //it is never used
    focus=center_tree //never used
    // center_tree = [width_tree / 2, height_tree /2] //for zooming from F:\Personal\Virtual_Server\PHPWeb\D3 Pan drop drag\DeniseMauldin Box
    // focus=center_tree
;

/**about tree elements*/
var 
    nodecircle_border_width = 3,
    nodecircle_border_color='slateblue',
    nodecircle_fill_hidedescendants_color = 'lightsteelblue',
    nodecircle_fill_showdescendants_color = 'lightyellow',
    nodecircle_fill_dragover_color = 'green',
    nodecircle_radius=10,

    nodetext_font_size = '1em' // xhtml div has to use 1em (=12 px) instead of units in pixels

;






