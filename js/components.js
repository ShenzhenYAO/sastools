// add title and descriptions .
function addtitledesc(titletext, gitcommitver, githuburl) {
    var titlediv = d3body.append('div').attr('class', 'titlediv')
    // add the h2 title
    titlediv
        .append('p')
        .attr('class', 'pagehead')
        // .styles({'font-size': '72px', 'font-weight': '200', 'font-family': "'Source Sans Pro'"})
        .styles({ 'font-size': '24px', 'font-weight': 'normal', 'font-family': "Alfa Slab One" })
        .text(titletext)
        .append('span')
        .styles({ 'font-size': '12px', 'font-weight': 'normal' })
        .text(' [commit ' + gitcommitver + '] ')
        // if githuburl is not blank
        // if (githuburl !== undefined && githuburl !==null && githuburl !==""){
        // titlediv
        .append('a')
        .attrs({ 'href': githuburl, 'target': '_blank' })
        .text(githuburl)
        ;
    // }
}

/* This part is to load json str and save to a sessionStorage item. That way to avoid the async issue
	the trick is to get json object by d3.json(), and save into a sessionStorage item
	This is the only way I know that works in getting the stringified json out of d3.json()
*/
function loadjson(url) {
    d3.json(url, function (err, srcjson) {
        if (err) throw error;
        // var jsonstr = JSON.stringify(srcjson)
        tmptxt = JSON.stringify(srcjson);
        //console.log(tmptxt)
        sessionStorage.setItem("loadedjsonstr", tmptxt);
		/*Note: the trick is to show the sessionStorage item in console.log
            if not show it in console.log, the reload will not be fired (started)
        This problem because using sessionStorage. When using sessionStorage, such problem disappears
            */
        // console.log(sessionStorage.getItem("loadedjsonstr")) ////
        if (sessionStorage.getItem("loadedjsonstr") === null) {
            // document.location.reload();
            document_reload();
        }
    });
}

// load JOSN from URL, no need to use sessionStorage
function newTreebyJsonfromURL(url) {
    d3.json(url, function (err, srcjson) {
        if (err) throw error;
        // create the tree data
        treeData = srcjson
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
function document_reload() {
    // console.log('to reload page')
    sessionStorage.setItem('pagereloaded', 'false')
    if (sessionStorage.setItem === 'false') {
        document.location.reload();
        sessionStorage.setItem('pagereloaded', 'true')
    }
}



// if the 'new diagram' button is clicked
function CreateNewGrandTree() {
    //hide the textbox
    hideSentences()
    // console.log("refresh and run newGrandTree")
    //create a new treeJSon, assign idx
    treeData = [{ idx: generateUUID(), name: "new" }]
    // make a new tree
    NewTree(treeData)
    // remember the file name in session
    sessionStorage.setItem('thejsonstrname', 'new_' + generateUUID());
}

// randomly generate a non-repeating id
//https://bl.ocks.org/adamfeuer/042bfa0dde0059e2b288
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


/**JQuery to check DOM Element changes and take actions as specified*/
$(document).ready(function () {

    //load existing file
    $('#file_input').on('change', function () {

        //hide the textbox
        hideSentences()

        //console.log(this.files) // 'this' refers the input DOM element, this.files are a list of files (e.g., multiple files are selected in the open file dialog box)
        var thefirstfileobj = this.files[0]; // the value of thefirstfile is a map with fields like 'name;, size, type, etc.
        // console.log('thefirstfileobj======')
        console.log(thefirstfileobj)

        //save the input file name into the sessionStorage
        sessionStorage.setItem('thejsonstrname', thefirstfileobj.name);

        //get the extension name
        var ext = thefirstfileobj.name.substring(thefirstfileobj.name.lastIndexOf('.') + 1)
        // console.log(ext)

        if (ext.toLowerCase() === 'egp') { // if the extension is egp, run import from egp
            // console.log(this)
            ImportFromEGPAfterReloading(this);
            // let the file name be like .egp.json
            sessionStorage.setItem('thejsonstrname', thefirstfileobj.name + '.json');
        } else { // else run import from json
            // use the function readfile to read the first file, get the treeData, and use the treedata to make a new tree
            readlocalfile(thefirstfileobj, function (f) { // the 'funciton(f){...}' part is the call back function coresponding to the 'callback' in the function readfile()
                // console.log(f.target.result)
                treeData = JSON.parse(f.target.result)
                // create the tree data
                // console.log('treeData when file_input is ready ======')
                // console.log(treeData)
                NewTree(treeData)
                // treeData = null;
                // collapseAll(rootdatapoint_sortedrowscols)
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
function readlocalfile(thefileobj, callback_whendoneDosomething) { // the fileobj is a file system object, containing file name, size, path, etc.
    var newreaderinstance = new FileReader(); // create a new instance of FileReader() class
    newreaderinstance.readAsText(thefileobj); // use the method readAsText of the new instance to read the file
    newreaderinstance.onload = callback_whendoneDosomething; // when the loading is done, run the call back function defined in the readfile instance
}




/**add a new element */
function addnewEle(width, height, id, clss, theparent, parentEleType, EleType, transfm) {
    if (theparent === null) {
        theparent = d3.select(parentEleType);
    }
    //console.log(theparent)
    var newEle = theparent.append(EleType)
        //its size = the size of tree diagram + margins
        .attr("width", width)
        .attr("height", height)
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
    nodes.forEach(function (d) { d.y = d.depth * between_nodes_horizontal; });

    //join (link data to empty g elements)
    var node = thetreeG.selectAll("g.nodeGs") // note that it is to select all elements within g with the classname = nodeGs
        .data(nodes, function (d) { return d.id || (d.id = ++i); }); // each data point was assigned an id (d.id)
    // console.log('node ======')
    // console.log(node)

    //enter (add g elements according to joined node)
    var nodeEnter = node.enter().append("g")
        .attr("class", "nodeGs")
        .attr("transform", function (d) {
            // the following is to adjust the starting position when the hidden nodes are about to be shown, and
            // the parent of the hidden nodes is the root
            // under such circumstances, it seems that there is bug that the starting vertical position was wrong
            // and need to be offset by moving the y0 up for the distance of the value in 'between_nodes_vertical'                

            return "translate(" + parentdatapoint.y0 + "," + parentdatapoint.x0 + ")";

        }) //each g are added at the position x0,y0 of the source data
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
        .style("fill", function (d) {
            return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color;
        });

    // add symbols into g.nodeGs (e.g., a rectale to indicate substeps, etc)
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_substeps' })
        .attr('transform', 'translate (20, -8)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_substeps')
        .attr('width', 6)
        .attr('height', 0)
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_video' })
        .attr('transform', 'translate (-24, -8)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_video')
    //     .attr('width', 6)
    //     .attr('height',6)
    //     .attr("xlink:href", "pix/video.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_warning' })
        .attr('transform', 'translate (-22, -16)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_warning')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/warning.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_question' })
        .attr('transform', 'translate (-14, -19)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_question')
    //     .attr('width', 10)
    //     .attr('height',10)
    //     .attr("xlink:href", "pix/question.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_learning' })
        .attr('transform', 'translate (-4, -22)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_learning')
    //     .attr('width', 8)
    //     .attr('height',8)
    //     .attr("xlink:href", "pix/learning.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_code' })
        .attr('transform', 'translate (4, -20)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_code')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/code.png")
    nodeEnter.append('g') // add a group element to hold the substeps symbol
        .attrs({ 'class': 'nodesymbolGs_info' })
        .attr('transform', 'translate (12, -16)') // move to 2 o'clock of the node circle
        .append("svg:image")
        .attr('class', 'nodesymbol_info')
    //     .attr('width', 12)
    //     .attr('height',12)
    //     .attr("xlink:href", "pix/info.png")


    // add text into g.nodeGs> instead of <text>, use foreignObject, and div which is more flexible for multiple lines and text formating
    nodeEnter.append('g') // has to wrap the div inside a g element so as to transform (adjust the text label's position relative to the node)
        // .transition().duration(2)
        .attr('class', 'nodetextGs')
        .attr('transform', 'translate (-110, 10)') // to move the text g box back (under nodes and centered)
        .append('foreignObject').attr('width', 220).attr('height', '50')
        .append('xhtml:div')
        .attr('class', 'nodetext')
        .text(function (d) { return d.data.name; }) //v4
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
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    // update (change properties of the ciricle elements, including x/y coordinate, size, color, etc)
    nodeUpdate.select("circle.nodecircles")
        .transition().duration(showhidedescendants_duration)
        .attr("r", nodecircle_radius)
        .style("fill", function (d) {
            return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color;
        })
        .style("stroke", function (d) { return (d.data.NodeDescription ? "blue" : nodecircle_border_color) }) //d3v4 show different color on whether or not having description
        ;

    // update whether or not to show the symbol for substeps
    nodeUpdate.select("image.nodesymbol_substeps")
        .attr('height', d => {
            return d.data._substeps ? 6 : 1e-6;
        })
        .attr("xlink:href", d => {
            return d.data._substeps ? "pix/subdiagram.png" : null;
        })
        ;

    // update whether or not to show the symbol for video
    nodeUpdate.select("image.nodesymbol_video")
        // depends on whether d.data.NdeDescription contains the text '<iframe class="ql-video"' which is 
        // a characteristic that the description contains a video iframe
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')) {
                return 6
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')) {
                return 6
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<iframe class="ql-video"')) {
                return "pix/video.png"
            } else {
                return null
            }
        })
        ;
    // depends on whether d.data.NdeDescription contains the text '<div class="ql-code-block-container"' which is 
    // a characteristic that the description contains code (text in code format)
    nodeUpdate.select("image.nodesymbol_code")
        // depends on whether d.data.NdeDescription contains the text '<div class="ql-code-block-container"' which is 
        // a characteristic that the description contains code (text in code format)
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('<div class="ql-code-block-container"')) {
                return "pix/code.png"
            } else {
                return null
            }
        })
        ;
    // depends on whether d.data.NdeDescription contains the text '[_Q]' which indicates 
    //  the descripton contains questions
    nodeUpdate.select("image.nodesymbol_question")
        // depends on whether d.data.NdeDescription contains the text '[_Q]' which indicates 
        //  the descripton contains questions
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_Q]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_Q]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_Q]')) {
                return "pix/question.png"
            } else {
                return null
            }
        })
        ;
    // depends on whether d.data.NdeDescription contains the text '[_W]' which indicates 
    //  the descripton contains warnining/notice message
    nodeUpdate.select("image.nodesymbol_warning")
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_W]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_W]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_W]')) {
                return "pix/warning.png"
            } else {
                return null
            }
        })
        ;
    nodeUpdate.select("image.nodesymbol_info")
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_I]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_I]')) {
                return 12
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_I]')) {
                return "pix/info.png"
            } else {
                return null
            }
        })
        ;
    nodeUpdate.select("image.nodesymbol_learning")
        .attr('width', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_L]')) {
                return 8
            } else {
                return 1e-6
            }
        })
        .attr('height', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_L]')) {
                return 8
            } else {
                return 1e-6
            }
        })
        .attr('xlink:href', d => {
            if (d.data.NodeDescription && d.data.NodeDescription.includes('[_L]')) {
                return "pix/learning.png"
            } else {
                return null
            }
        })
        ;
    //update (change properties of the text elements, including x/y coordinate, size, color, etc)
    nodeUpdate.select("div.nodetext")
        .transition().duration(showhidedescendants_duration)
        .style("opacity", 1)
        .style("font-size", nodetext_font_size)
        .style('color', d => { // if the description contains [to do], turn label into red color
            var theCheckToDo = checkToDo(d);
            if (theCheckToDo === 1) { return "red"; } else { return "black"; }
        })
        ;

	/** exit g groups (For the elements that are not joined in node, make them travel back to the coordinate x y of 
	 * the parentdatapoint, then remove these unbinded elements)*/
    var nodeExit = node.exit()
        .transition()
        .duration(showhidedescendants_duration)
        .attr("transform", function (d) {
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
        .data(links, function (d) { return d.id; }); //v4  d.id can befound in _enter => 0:q => __data .id, which is corresponding to the d.id in node object
    // console.log('link ===')
    // console.log(link)

    // enter (add path elements according to joined link)
    var linkEnter = link.enter().insert('path', "g") //v4
        .attr("class", "primarylinks")
        .attr("stroke-opacity", 1e-6)
        .attr("d", function (d) {
            var o = { x: parentdatapoint.x0, y: parentdatapoint.y0 };
            return diagonal(o, o); //v4 // initially, let the s (source) and d(destination) coordinates of the path be the same: x0, y0 of the parentdatapoint
        });
    // console.log('linkEnter ===')
    // console.log(linkEnter)

	/* update (change waypoints of the path, 
		i.e., recalculating the path waypoints at any time during the transition) */
    var linkUpdate = linkEnter.merge(link); //d3v4
    linkUpdate.transition()
        .duration(showhidedescendants_duration)
        .attr("stroke-opacity", 1)
        .attr('d', function (d) { return diagonal(d.parent, d) });
    // attr('d', ..) is the final path after transition, it is from x,y coordinate of the parentnode to x,y of the current node

    // exit, make transition by changing the path waypoints towards the parent node, and eventually remove the path lines
    link.exit().transition()
        .duration(showhidedescendants_duration)
        .attr("stroke-opacity", 1e-6)
        .attr("d", function (d) {
            var o = { x: parentdatapoint.x, y: parentdatapoint.y };
            return diagonal(o, o); // v4 it is the final path after transition: all waypionts are at the x,y of the parentdatapoint	
        })
        .remove();

    /**update x0, y0 ********************************************************************************/
    // for each data element, update the x0 and y0 as the current d.x, and d.y, so as to toggle between expansion/collaspe
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    //save all d.x, to be used for adjust horizontal shift error caused by tree().nodeSize() method
    var vcoords = [];
    nodes.forEach(d => { vcoords.push(d.x) });

    var results = {
        'vcoords': vcoords,
        'nodeupdate': nodeUpdate
    }

    //there might be additional pseudolinks that are not cleaned
    d3.selectAll('path.pseudolinks').remove()

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

    var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(d);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from

} 	// end showhidedescendants

//estimate tree size
function estTreesize(therootdatapoint) {
    // console.log('the root data point =======')
    // console.log(therootdatapoint)

    /*B.1.2.0, have a tree instance with default size setting */
    var tmptreeinstance = d3.tree();
    /*B.1.2.1, flatten the data points, putting them in an array */
    var flatterneddatapoints = tmptreeinstance(therootdatapoint).descendants(); // despite of the default tree()size setting, nodes in different rows yet have different d.x (e.g., 0.875, 0.75, etc. The diff is small but can be identified)
    // console.log('flatterneddatapoints ===')
    // console.log(flatterneddatapoints)

    /**B.1.2.2 for each datapoint, get the sorted row and col number  */
    flatterneddatapoints_sortedrowscols = getSortedRowsCols(flatterneddatapoints);

    /**B.1.2.3 get the maxrows and cols */
    var maxrowscols = getmaxrowscols(flatterneddatapoints_sortedrowscols)
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

    return { 'width': width_tree, 'height': height_tree }

} // end estTreesize()

// Collapse the node and all it's children. It is also new in d3v4
// recursively collapse all nodes
function collapse(d) {
    // console.log(d)
    if (d.children) {
        d._children = d.children
        d.children = null
        d._children.forEach(collapse)
    }
}
function collapseAll(source) {
    collapse(source)
    var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(source);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from

    // if collapse to root, return the default view (simulate a right click on treerect)
    if (source.parent === null || source.parent === undefined) {
        //right click the rect to return to the deafult tree view
        // console.log(source)
        https://stackoverflow.com/questions/7914684/trigger-right-click-using-pure-javascript
        var element = thetreerect.node()
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


function expandAll(source) {
    var theurl = "http://epicanada.x10host.com/sound/clickbutoon2.mp3";
    playclicksound(theurl);
    expand(source);
    var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(source);
    pan();
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from
}
function expand(d) {
    var children = (d.children) ? d.children : d._children;
    if (d._children) {
        d.children = d._children;
        d._children = null;
    }
    if (d.children) { // recursively expand d.children
        d.children.forEach(c => {
            expand(c)
        })
    }
} // end function expand


function playclicksound(theURL) {
    /*var theurl ="http://epicanada.x10host.com/sound/clickbutoon2.mp3"*/
    var theAudio = new Audio(theURL);
    theAudio.play();
}

// create a new tree, add pan and custlinks
function NewTree(thetreedata) {

    //B.0 console.log('show treeJSON =======')
    /**check if treeJSON is an Array ([..]). If so, change it to a JSON like obj ({...}) */
    if (Array.isArray(thetreedata)) {
        treeJSON = thetreedata[0];
    } else {
        treeJSON = thetreedata;
    }
    // console.log('treeJSON is ===========================')
    // console.log(treeJSON)

    // delete all existing nodeGs
    d3.selectAll('g.nodeGs').remove()
    d3.selectAll('path.custlinks').remove()
    d3.selectAll('path.primarylinks').remove()
    d3.selectAll('path.pseudolinks').remove()


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
    var rootdatapoint = d3.hierarchy(treeJSON, function (d) { return d.children; }); //v4 Note: it creates .depth and .height, but not .id
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
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2;
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
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from

    //save the treeJson Root into session
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);

    /**sessionStorage is limited by the max of 2MB, if the jsonstr, it cannot be put into the sessionStorage
     * The following is to split it into multiple parts
     * */
    var quota = 2000000
    if (jsonstr.length > quota) {
        console.log('the json file is too large (> 2MB), cannot be saved in sessionStorage')
    } else {
        sessionStorage.setItem('thejsonstr', jsonstr);
    }
}// end function NewTree()



/****make custlinks *********************** */
function custlink(parentdatapoint, shownnodes) {

    // get customized parents 
    //loop for each node in tmpnodes
    var custlinks_crude = []; /**have all custlinks from the available nodes. It is called '_crude' as some may not have the source/targe node of the link showing in the tree map */
    var shownnodesData = [] //prepare an array of data binding to the shown nodes
    // console.log('shownnodes=======')
    // console.log(shownnodes)

    shownnodes.attr('fakeattr', d => { // a trick to get binded data from d3 obj

        //get a collection of data binding to the shown nodes
        shownnodesData.push(d)

        if (d.data.custparents) { // if the current data has custparents 
            var thecustparents = d.data.custparents;
            thecustparents.forEach(c => { //(note, there could be multiple!)
                var thecustlink = {}, tmp = {}, tmpdata = {};
                //get data.idx of the parent from d.data.custparents. Note: .custparents only contains idx of the custparents
                tmp.data = tmpdata;
                tmp.data.idx = c.idx;
                thecustlink.parent = tmp; // the above three lines are to create layers like thecustlink.parent.data.idx, which is to simulate the structure of the tree data
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
    var validcustlinks = [];

    // for each custlinks:
    custlinks_crude.forEach(d => { // d is a crude custlink
        // console.log('crude custlink ===')
        // console.log(d)
        shownnodesData.forEach(n => {  // n is a node shown in the tree
            // console.log('entered node ===')
            // console.log(n)

            //1 check if the source node's parent is a child of target node
            if (d.parent.data.idx === n.data.idx) { // if n and d.parent have the same idx
                // console.log('in custlink.parent =========')
                // console.log(d.parent.data.idx )
                // console.log('in node =========')
                // console.log(n.data.idx, n.data.name)

                var d_ChildOf_n = 0;

                // if the source note is custlink.parent do not make custlink (if the source/target of a custlink are indeed parent-child, a default link has been added by MakeChangeTree, no need to add custlink again)
                if (n.children) {
                    n.children.forEach(b => {
                        // console.log('the crude custlink ===')
                        // console.log(d)
                        // console.log('n.child ====')
                        // console.log(b)
                        if (b.data.idx === d.data.idx) {
                            d_ChildOf_n = 1;
                            // console.log(b.data.idx)
                            // console.log(d.data.idx)
                        }
                    })
                }
                //also, if the custlink is the parent of the current node (n), do not do not make custlink (if the source/target of a custlink are indeed parent-child, a default link has been added by MakeChangeTree, no need to add custlink again)
                if (n.parent && d.data.idx === n.parent.data.idx) {
                    d_ChildOf_n = 1;
                }
            }


            if (d_ChildOf_n === 0) {
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
        .data(validcustlinks, function (d) { return d.whatever; }); //v4 the return value is not used, so return whatever

    // console.log('custlink ===')
    // console.log(custlink)


    // enter (add path elements according to joined custlink)
    var custlinkEnter = custlink.enter().insert('path', "g") //v4
        .attr("class", "custlinks")
        .attr("stroke-opacity", 1e-6)
        .attr("d", function (d) {
            // console.log(d)// d contains elements of the data binding to the path
            var o = { x: parentdatapoint.x0, y: parentdatapoint.y0 }; // this is different here from building links
            // var o = {x: d.parent.x, y: d.parent.y}; // for each path, let the link start from the parent's x, y
            return diagonal(o, o); //v4 // initially, let the s (source) and d(destination) coordinates of the path be the same: x0, y0 of the parentdatapoint
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
        .style("cursor", "pointer")
        .attr('d', function (d) { return diagonal(d.parent, d) });
    // attr('d', ..) is the final path after transition, it is from x,y coordinate of the parentnode to x,y of the current node


    // exit, make transition by changing the path waypoints towards the parent node, and eventually remove the path lines
    custlink.exit().transition()
        .duration(showhidedescendants_duration)
        .attr("stroke-opacity", 1e-6)
        .attr("d", function (d) {
            var o = { x: parentdatapoint.x, y: parentdatapoint.y };
            return diagonal(o, o); // v4 it is the final path after transition: all waypionts are at the x,y of the parentdatapoint	
        })
        .remove();

} // end custlink()



function deletecustlink(thecustlinkElm) {

    thecustlinkd3obj = d3.select(thecustlinkElm)

    var thecustlinkdata;
    thecustlinkd3obj.attr('fakeattr', d => {
        thecustlinkdata = d;
    })

    // console.log(thecustlinkdata)
    // the idx of the target node of the thecustlinkdata
    // var thetgtidx = thecustlinkdata.idx
    var thesrcidx = thecustlinkdata.parent.data.idx
    if (thecustlinkdata.data.custparents !== null && thecustlinkdata.data.custparents !== undefined) {
        //loop to match thesrcidx to an idx in custparents
        var thecustparents = thecustlinkdata.data.custparents
        thecustparents.forEach((d, i) => {
            if (d.idx === thesrcidx) {
                // delete the matched idx from the custparents
                thecustparents.splice(i, 1) // use splice() only there is ONE matched item in the array
            }
        })
        // console.log(thecustlinkdata.data)
        // if thecustparents is empty, delete the field thecustparent
        if (thecustlinkdata.data.custparents.length === 0) {
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
function ZoomInOutSelectedNode(d) {

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
        y = currentsvgh / 2 - offsetshiftup; // height2 /2;

        // 5.1.2.b.2 set the zoom level =1 (zoom out)
        zoomLevel = 1;

        // 5.1.2.b.3 nulify the var centeredNode 
        centeredNode = null;

    }

    //5.1.3 determine the string for travel (translate)
    // the syntax is like 'translate (221, 176)'
    var translate_mapUpperLeft = 'translate (' + currentsvgw / 2 + ',' + currentsvgh / 2 + ')'

    //5.1.4 determine the string for enlarge/shrink (scale)
    var scaleStr = 'scale (' + zoomLevel + ')'

    //5.1.5 determine the offset 
    var translate_offsetSelectedPath = 'translate (' + -x + ',' + -y + ')'

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
function getmaxrowscols(flatterneddatapoints_sortedrowscols) {
    var maxRows = 0, maxCols = 0, result = [];
    flatterneddatapoints_sortedrowscols.forEach(function (d, i) {
        maxRows = Math.max(maxRows, d.sortedrow);
        maxCols = Math.max(maxCols, d.sortedcol);
    });
    // console.log(maxRows)
    result.push(maxRows + 1); // the rows and cols start from 0, so if maxrows = 6, there are indeed 7 rows. Same for maxcols
    result.push(maxCols + 1);
    return result;
}


/**For a given element, find its transform values
 * https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4/38230545#38230545
 * the transform values are saved at:
 * .transform.baseVal[0].matrix, or .transform.baseVal.consolidate().matrix
 */
function getTransformValues(theEle) {
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

function newtree_offsetNodeSizeMethodShiftError() {

    treeinstance = d3.tree().size([height_tree, width_tree]);
    var results = MakeChangeTree(rootdatapoint_sortedrowscols);
    //? need to run the custlink? maybe not
    noshift = d3.min(results.vcoords)

    // 2) use tree nodeSize() method to make a tree of automatically defined size
    treeinstance = d3.tree().nodeSize([between_nodes_vertical, between_nodes_horizontal]);//d3v4
    var results = MakeChangeTree(rootdatapoint_sortedrowscols);
    //? need to run the custlink? maybe not
    var shiftup = d3.min(results.vcoords)
    // console.log(noshift, shiftup)
    var offsetshiftup = noshift - shiftup + TreeMarginToSvg.top
    var offsetNodeSizeMethodShiftTranslateStr = 'translate(' + TreeMarginToSvg.left + ', ' + offsetshiftup + ')';

    thetreeG.transition().duration(3500).attr('transform', offsetNodeSizeMethodShiftTranslateStr);

    return { 'offsetshiftup': offsetshiftup } // for use in the translation adjustment in zooming (see components.ZoomInOutSelectedNode)

}



// return the mouse key as str (right/left button, with shiftKey, altKey, ctrlKey, or any combination)
//https://stackoverflow.com/questions/12518741/determine-if-shift-key-is-pressed-during-mousedown-event
function getmousekey() {

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
    var mousebutton = '-unknown', shift = '', alt = '', ctrl = '';
    if (d3.event.buttons === 1) {
        // note that a value of 0 is indeed the primary key (usually set as the left mouse click but for people using their left hand, it might be set as right mouse click )
        mousebutton = '-primary(left)'
    } else if (d3.event.buttons === 2) {
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
    result = mousekey.slice(1) // substr from position 1 to end
    return result;
}



// when the mouse is pressed down, the following actions will be triggled
// drag and drop function works when a mousedown is detected for a g.nodeGs element, which is set in components.MakeChangeTree()    
function dragdrop() {

    event.stopPropagation(); // the mousedown is also listened by the treeG (for dragging the map) This line prevents
    event.preventDefault();

    var mousedown = 1; // to indicate that mousedown status = 1 (this is for debug purpose)
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
    var theSelectedObj = d3.select(this);

    // determine the mouse event (right/left click, with shiftKey, altKey, ctrlKey, or any combination)
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons

    // for fun!
    showtext = getmousekey() // this is to get a string which indicates what mouse button and shift/ctrl/alter keys are pressed
    d3.selectAll('g.pseudonodeGs').remove() // remove the previously created psuedonodeGs, otherwise there'll be more and more such psuedonodeGs

    // create a pseudo g group, containing a circle, and a text box
    pseudoNodeG = svg.append('g').attr('class', 'pseudonodeGs').attr('transform', 'translate (' + ((between_nodes_horizontal - 20) / 2) + ',0) '); // transform to make the text label visible
    pseudoNodeCircle = pseudoNodeG.append('circle').attr('class', 'pseudonodecircles');
    // var pseudoNodeText = pseudoNodeG.append('text').attr('class', 'pseudonodetext').attr('dy', '20').text(showtext);
    pseudoNodeText = pseudoNodeG
        .append('g')
        .attr('class', 'nodetextGs')
        .attr('transform', 'translate (' + (-(between_nodes_horizontal - 20) / 2) + ', ' + pseudonodetext_offsetdown + ')') // to move the text g box back (under nodes and centered)
        .append('foreignObject').attr('width', between_nodes_horizontal - 20).attr('height', between_nodes_vertical - 5)
        .append('xhtml:div')
        .attr('class', 'pseudonodetext')
        .text(showtext)

    //add a pseudo cross link
    var theSrcXY = { 'x': 0, 'y': 0 }; //initialize the src xy obj
    //get the x, y of the sourceObj;
    theSelectedObj.attr('fakeattr', d => {
        theSrcXY.x = d.x;
        theSrcXY.y = d.y;
    })
    // add a pseudo crosslink
    var thepseudolink = thetreeG.append('path')
        .attr('class', 'pseudolinks')
        .attr('d', d => {
            return diagonal(theSrcXY, theSrcXY);
        })


    // detect mouse move
    d3.select(window)
        .on("mousemove", mousemove_dragdrop)
        .on("mouseup", mouseup_dragdrop);

    //on mousemove, check the keys and do different tasks
    function mousemove_dragdrop() {
        // for left mouse button only, run drag and drop to change node parent
        if (getmousekey() === 'primary(left)') {
            mousemove_dragdrop_primary();
        }
        if (getmousekey() === 'shift-primary(left)') {
            // console.log('shift-primary(left) pressed')
            mousemove_dragdrop_shiftprimary();
        }
    }

    //on mouseup, check the keys and do different tasks
    function mouseup_dragdrop(d) {
        //when mouse is up, need to determine whether the mouse is over a node or not
        // note that the mouseup is not binded to any mouse button; therefore the getmousekey() returns values like 'unknown',or 'shift-unknown' (the heading and trailing '-' are always trimmed)
        // for left mouse button only, run drag and drop to change node parent
        if (getmousekey() === 'unknown') {///!!! make a video about it
            mouseup_dragdrop_primary();
        }
        if (getmousekey() === 'shift-unknown') {
            // console.log('shift key pressed when mouse is up')
            mouseup_dragdrop_shiftprimary();
        }
    }

    // on shift - mouse up, do the following
    function mouseup_dragdrop_shiftprimary() {
        var mousemove = 0, mousedown = 0; // these are for debug purpose

        //remove the pseudo link
        thepseudolink.remove()

        /** if theTgtD3Obj not null, not undefined:
         * 1) find .data.custparents of theTgtD3Obj
         * 1) add the idx of theSrcD3Obj into the custparents of theTgtD3Obj
         * 3) run MakeChangeTree()
         */
        var theSrcIdx;
        if (theTgtD3Obj !== null && theTgtD3Obj != undefined) {
            //0) get the idx of the source d3 obj
            theSrcD3Obj.attr("fakeattr", d => {
                theSrcIdx = d.data.idx;
            })

            var addcustlink = 0;

            //1) find and update .data.custparents of theTgtD3Obj
            theTgtD3Obj.attr("fakeattr", function (d) {
                // console.log('data binding to the target node')
                // console.log(d)
                var srcIdxExist = 0;
                if (d.data.custparents === null || d.data.custparents === undefined) {
                    d.data.custparents = []
                    // inidicate that the srcIdx does not exist
                    // !!! but do not push the srcIdx yet, as the srcIdx might be d.data.idx itself. In that case, srcIdxExist should be 1, i.e., the node itself cannot be its custparent
                    srcIdxExist = 0;
                } else {
                    // if theSrcIdx is the target nodes's idx, let srcIdxExist=1 (do not add its own idx to its custparents)
                    if (d.data.idx === theSrcIdx) {
                        srcIdxExist = 1;
                    }
                    // loop and check if theSrcIdx is in the list. If so, let srcIdxExist=1
                    d.data.custparents.forEach(e => {
                        if (e.idx === theSrcIdx) {
                            srcIdxExist = 1;
                        }
                    })
                }
                if (srcIdxExist === 0) { // if theSrcIdx does not exist, add it to the parent list
                    d.data.custparents.push({ 'idx': theSrcIdx })
                    addcustlink = 1;
                }
            })
            //add cross line
            if (addcustlink === 1) {

                // console.log(addcustlink)
                var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
                //   console.log(proposedTreesize.width, proposedTreesize.height)
                rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node

                // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
                treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
                updateTree = MakeChangeTree(rootdatapoint_sortedrowscols)
                pan()
                custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate)
            }

            d3.event.stopPropagation()   // stop mouseover??           

        }
    } // mouseup_dragdrop_shiftprimary



    function mousemove_dragdrop_shiftprimary() {

        d3.event.preventDefault();// prevent the default text dragging

        // determine the src d3obj
        theSrcD3Obj = theSelectedObj;
        // console.log(theSrcD3Obj)

        //************************************************************************************ */        

        // when mouse move, let the pseudo g move with the mouse, get the coordinates relative to the tree rect
        var tmpxyarray = d3.mouse(thetreeG.node());
        //calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
        var
            mousecurrentxy = { "y": parseInt(tmpxyarray[0]), "x": parseInt(tmpxyarray[1]) }; // y is horizontal, x vertical in d3 horizontal tree

        //transit the path
        thepseudolink.transition()
            .duration(0)
            .attr("stroke-opacity", 1)
            .attr('d', function (d) { return diagonal(theSrcXY, mousecurrentxy) });

        //************************************************************************************ */

        /**check if mouse is over a g group, remember it as the targetD3Obj */
        d3.selectAll('g.nodeGs')
            .attr('pointer-events', 'mouseover') //? is this line a must???
            .on("mouseover", function (d) {

                // Remember the data point corresponding to the node group that the mouse is over
                theTgtD3Obj = d3.select(this)
                // console.log ('mouse is over ===')
                // console.log(d)
                // console.log(theTgtD3Obj)
                //mouseoverObj.select('circle.nodecircles').style('fill', nodecircle_fill_dragover_color);
            })
            .on("mouseout", function (d) {
                theTgtD3Obj = null;
            })
            ;

    } //end mousemove_dragdrop_shiftprimary


    function mousemove_dragdrop_primary() {
        var mousemove = 1;
        // console.log( '2. mousedown & move = ' + mousedown + ',' + mousemove)
        d3.event.preventDefault();// prevent the default text dragging        

        // make the selected g and its components dimmed
        // ideally once the mouse move is detected, it is better to make the selected node and its descendants invisible. 
        // But, it is not a must to do!

        // show circle and text in the pseudonodeG with the same property as of the selected g group obj (same node, same text label, sam colors, etc)
        var theSelectedCircleObj = theSelectedObj.select('circle.nodecircles');
        pseudoNodeCircle
            .attr("r", theSelectedCircleObj.attr("r"))
            .attr('stroke-width', theSelectedCircleObj.attr("stroke-width"))
            .attr('stroke', theSelectedCircleObj.attr("stroke"))
            .style('fill', theSelectedCircleObj.style("fill"))
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
        var tmpxyarray = d3.mouse(thetreerect.node());

        //calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
        var
            mousecurrentxy = { "toLeft": parseInt(tmpxyarray[0]), "toTop": parseInt(tmpxyarray[1]) },
            mousexystr = "(" + (mousecurrentxy.toLeft + 20) + ',' + (mousecurrentxy.toTop + 20) + ')', // that 20 makes the pseudo circle and text 20 px down and right to the mouse cursor, so that the mouseover won't be interferered
            translatestr = 'translate ' + mousexystr;

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
            .on("mouseover", function (d) {

                // console.log('3. mousedown move = ' + mousedown + ',' + mousemove + ' over the node: ' + d.data.name)
                mouseoverObj = d3.select(this)
                mouseoverObj.select('circle.nodecircles').style('fill', nodecircle_fill_dragover_color);
            })
            .on("mouseout", function (d) {
                // d3.select(this).select('circle.nodecircles').style('fill',nodecircle_fill_showdescendants_color) // not correct, fill color could be different depending on whether there are descendants hidden
                d3.select(this).select('circle.nodecircles').style('fill', function (d) {
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
    function mouseup_dragdrop_primary() {
        var mousemove = 0, mousedown = 0; // these are for debug purpose

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
        if (theParentToChangeObj !== null && theParentToChangeObj != undefined) {

            //1) add theSelectedObj as the last child to theParentToChangeObj
            // console.log('theParentToChangeObj===========')
            // console.log(theParentToChangeObj)
            theParentToChangeObj.attr('new_attr', '');
            theParentToChangeObj.attr("new_attr", function (d) {
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
                theSelectedObj.attr("new_attr", function (d) {
                    // console.log('the selected obj data ===')
                    // console.log(d)

                    var theSelectedObjData = d;

                    // !!! must have. recursively find theSelectedObjData 's ascendants do not make changes
                    // if theParentToChangeData is in the ascendants stop make changes
                    var ascendants = [];
                    function getAscendants(d) {
                        // console.log("d.parent===")
                        // console.log(d.parent)
                        if (d.parent !== undefined && d.parent !== null) {
                            ascendants.push(d.parent)
                            getAscendants(d.parent)
                        }
                    }
                    // console.log('ascendants ====')
                    // console.log(ascendants)
                    getAscendants(theParentToChangeData);
                    var stopchangingparent = 0;
                    //if dragging to the node itself, do not make changes
                    if (theParentToChangeData === theSelectedObjData) {
                        stopchangingparent = 1
                    }
                    if (ascendants.includes(theSelectedObjData)) {
                        stopchangingparent = 1;
                    }
                    // console.log('stopchaningparent ====')
                    // console.log(stopchangingparent)

                    if (stopchangingparent != 1) {

                        // find the original parent of the selected obj data
                        var originalParentData = theSelectedObjData.parent
                        // console.log('originalParentData=================')
                        // console.log(originalParentData)                        

                        /**The following blocks are for deleting original parent-children relationships
                         * It has to be done before the rest
                         * If the nodes are drag and dropped within the same parent, this will
                         * cause :1) delete the orginal relationship; 2) add the selected node as the child
                         *  to the orignal parent.
                         * This is correct as the selected node will still be linked to the same parent, justing
                         *  changing its position within the siblings. 
                         * 
                         * The program has been set as such that the same child won't be added for twice. This
                         *  is to prevent adding duplcated children. 
                         * For the above situation (moving the child within the same parent), if the adding-node is 
                         *  preceeding the removing-node action, it'll cause error.
                         *  When adding was performed first, the selected child won't be added into the same 
                         * parent as it exists. However, the consequent removing action will remove the child.
                         * As the child would never be added back, it'll be lost!
                         *  
                        */
                        // within originalParentData's children find the one which equals to the selected obj data, and remove it from the children array
                        for (i = 0; i < originalParentData.children.length; i++) {
                            if (originalParentData.children[i] === theSelectedObjData) {
                                originalParentData.children.splice(i, 1); //use splice() only when there is ONE matched item
                                break;
                            }
                        }
                        for (i = 0; i < originalParentData.data.children.length; i++) {
                            if (originalParentData.data.children[i] === theSelectedObjData.data) {
                                originalParentData.data.children.splice(i, 1); //use splice() only when there is ONE matched item
                                break;
                            }
                        }
                        // must have!!! if originalParentData.children =[] make it null. (d3 tree goes wrong if .children =[])
                        if (originalParentData.children.length === 0) {
                            originalParentData.children = null;
                        }
                        // console.log('originalParentData.children=====')
                        // console.log(originalParentData.children)



                        // console.log ('make changes ====')

                        //!!! must have // added in commit 137a ============
                        if (theSelectedObjData.data.custparents === undefined || theSelectedObjData.data.custparents === null) {
                            theSelectedObjData.data.custparents = []
                        }

                        if (theSelectedObjData.data.custparents.includes(theParentToChangeData.data)) { }
                        else {
                            // add the selected obj data.data (this is the original data) to theParentToChangeData.data.chilren
                            theSelectedObjData.data.custparents.push({ idx: theParentToChangeData.data.idx })
                        }
                        //!!! must have // added in commit 137a =============


                        //!!! must have. change theParentToChangeData._children to children
                        if (theParentToChangeData._children) {
                            theParentToChangeData.children = theParentToChangeData._children;
                            theParentToChangeData._children = null;
                        }

                        // add the selected obj data as the last child of theParentToChangeData
                        //!!! must have
                        if (theParentToChangeData.children === undefined || theParentToChangeData.children === null) {
                            theParentToChangeData.children = []
                        }
                        if (theParentToChangeData.children.includes(theSelectedObjData)) { }
                        else {
                            theParentToChangeData.children.push(theSelectedObjData) //simply push it to the end of the children array
                        }// console.log('theParentToChangeData===')
                        // console.log(theParentToChangeData)

                        //!!! must have
                        if (theParentToChangeData.data.children === undefined || theParentToChangeData.data.children === null) {
                            theParentToChangeData.data.children = []
                        }
                        if (theParentToChangeData.data.children.includes(theSelectedObjData.data)) { }
                        else {
                            // add the selected obj data.data (this is the original data) to theParentToChangeData.data.chilren
                            theParentToChangeData.data.children.push(theSelectedObjData.data)
                        }


                        // change the .parent property of theSelectedObjdata, change to theParentToChangeData.data
                        theSelectedObjData.parent = theParentToChangeData;

                        // !!! must change change depth = theParentToChangeData.depth +1
                        theSelectedObjData.depth = theParentToChangeData.depth + 1

                        //!!! must have! for all shown descendants of the selected obj data, update the depth
                        function getdescendants_shownchildren(a) {
                            if (a.children !== null && a.children !== undefined) {
                                a.children.forEach(function (v) {
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
                            if (a._children !== null && a._children !== undefined) {
                                a._children.forEach(function (v) {
                                    // children's depth = parent.depth +1
                                    v.depth = a.depth + 1;
                                    getdescendants_hiddenchildren(v)
                                    getdescendants_shownchildren(v) // must have !!! for ._children.children, also need to update the depth
                                })
                            }
                        }
                        getdescendants_hiddenchildren(d);






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
                        var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
                        //   console.log(proposedTreesize.width, proposedTreesize.height)
                        rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node

                        // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
                        treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
                        updateTree = MakeChangeTree(rootdatapoint_sortedrowscols)
                        pan()
                        custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate)
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
function pan() {


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
        var width_selectedtreerect = Number(thetreerect.attr('width'))
        var height_selectedtreerect = Number(thetreerect.attr('height'))
        var mouseHV_treerect = d3.mouse(thetreerect.node());


        if (0 <= mouseHV_treerect[0] && mouseHV_treerect[0] <= width_selectedtreerect
            && 0 <= mouseHV_treerect[1] && mouseHV_treerect[1] <= height_selectedtreerect) {

            //2. show current mouse position relative to the tree rect

            //2.1 calculate the coordinates and convert to strings for display and for transform.translate setting (i.e., for the text group to fly to)
            var mouseToTreeRect = { "toLeft": parseInt(mouseHV_treerect[0]), "toTop": parseInt(mouseHV_treerect[1]) },
                mousexystr = "(" + mouseToTreeRect.toLeft + ',' + mouseToTreeRect.toTop + ')';

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
                .on('mousemove', function () {

                    // 3.1 get the mouse coordinates to the treerect (as mouse is moving)
                    var tmpxyarray = d3.mouse(thetreerect.node());
                    var mouseToTreeRect = { "toLeft": parseInt(tmpxyarray[0]), "toTop": parseInt(tmpxyarray[1]) },
                        mousexystr = "(" + mouseToTreeRect.toLeft + ',' + mouseToTreeRect.toTop + ')';

                    //get the mouse coordinates about the treeG element
                    // Wrong! as mouse and treeG are both moving, it causes error here when trying to get mouse to treeG coordinate
                    // mouse_theTreeG = d3.mouse(thetreeG.node())
                    // console.log('mouse to g box')
                    // console.log(mouse_theTreeG)

                    //3.2 prepare translation string (for moving the treeG)
                    var thetreeGtranslateHV = "(" + (mouseToTreeRect.toLeft - mouse_theTreeG[0]) + ','
                        + (mouseToTreeRect.toTop - mouse_theTreeG[1]) + ')';
                    var translatestr = 'translate ' + thetreeGtranslateHV;
                    //3.3 show mouse position in pseudoNodeText
                    pseudoNodeText.text(mousexystr).style("opacity", 1)

                    //3.4 Must have!!! so as to enable pan when zoom in
                    var scaleStr = 'scale (' + zoomLevel + ')'

                    //3.5 let the treeG moves with the mouse move
                    thetreeG.transition().duration(0)
                        .attr('transform', translatestr + scaleStr);

                    //3.6 must have!!! when mouse up, callback 'mouseup_pan
                    d3.select(window).on('mouseup', mouseup_pan)

                })

        } else {
            // console.log('mouse point is NOT in the tree rect!')
        }
    }

    function mouseup_pan() {
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
function getSortedRowsCols(thisDataArray) {
    /*determine the row and col number for each data element*/
    var cols1 = [], rows1 = [], n_cols = 0, n_rows = 0;
    thisDataArray.forEach(
        function (d) {
            //define the cols1
            //if n_cols has not been defined
            if (n_cols = 0) {
                var n_cols = 1;
                cols1[0] = d.depth; // let the current element be the value of d.depth
            } else {
                //if n_cols has been defined
                //check if the d.depth can be found in the array cols1
                if (cols1.includes(d.depth) === true) {
                    //do nothing
                } else {
                    //if the current d.depth is a new value, push it into the end of the array
                    cols1.push(d.depth)
                }
            }
            //save the col number to the current d1
            d.col1 = cols1.indexOf(d.depth);

            //define the rows1
            //if n_rows has not been defined
            if (n_rows === 0) {
                var n_rows = 1;
                rows1[0] = d.x; // let the current element be the value of d.x
            } else {
                //if n_rows has been defined
                //check if the d.depth can be found in the array rows1
                if (rows1.includes(d.x) === true) {
                    //do nothing
                } else {
                    //if the current d.x is a new value, push it into the end of the array
                    rows1.push(d.x)
                }
            }
            //save the col number to the current d1
            d.row1 = rows1.indexOf(d.x);
        }
    );
    //now, the array cols1 and rows1 contains distinct rows and cols, and d.y/d.x values of the data elements
    //but the values in these arrays are not sorted, next is to sort the array, while keeping the original index number
    var cols2 = [], rows2 = [];
    cols1.forEach(
        function (d, i) {
            cols2[i] = { value: d, oldindex: i };
        }
    );
    rows1.forEach(
        function (d, i) {
            rows2[i] = { value: d, oldindex: i };
        }
    );
    //console.log(cols1)			
    var cols3 = cols2.sort(function (a, b) {
        return a.value - b.value;
    })
    //console.log(cols3)
    //console.log(rows1)	
    var rows3 = rows2.sort(function (a, b) {
        return a.value - b.value;
    })
    //console.log(rows3)

    //put the sorted oldindex into arrays	
    var sortedColOldindex = [];
    cols3.forEach(function (d, i) {
        sortedColOldindex[i] = d.oldindex;
    });
    //console.log(sortedColOldindex);
    var sortedRowOldindex = [];
    rows3.forEach(function (d, i) {
        sortedRowOldindex[i] = d.oldindex;
    });
    //console.log(sortedRowOldindex);

    /*next, in each data element, find the col1 and row1, which are corresponding to the oldindex in sortedColOldindex/sortedRowIndex
    e.g., sortedRowIndex[1] =0. in the data element, the current d.row1 = 0
    in this case, sortedRowIndex[1]= d.row1, as the oldindex and row1 are matched, we'll save d.sortedrow=index of row3, which is 1
    to do so, we'll
        1) search the indexOf the value 'd.row1' in the array sortedRowIndex
        2) save the found index number into d.sortedrow
    */
    thisDataArray.forEach(function (d) {
        d.sortedrow = sortedRowOldindex.indexOf(d.row1);
        d.sortedcol = sortedColOldindex.indexOf(d.col1);
        delete d.row1; delete d.col1;
    });

    return thisDataArray;
}	//end of function



//sava tasks and crosslinks into a local JSON file
function exportData_local_d3v4() {
    //expand all
    //expandAll(theGrandRoot_obj) //it causes error and stop exporting

    //newidea, purify the root data by only selecting the ones won't causing circular structure
    var thesrcdata = [rootdatapoint_sortedrowscols.data]// this is for v4, as the root data structure is different from that of v3
    //However, simply taking the .data part at the root level is good enough, as the data inside has the same structure  as thatof v3


    // console.log(thesrcdata)
    var updatedData = selectCopy(thesrcdata)
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
            blob = new Blob([json], { type: "octet/stream" }),
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
function selectCopy(obj) {
    var ar2 = []; // create empty array to hold copy

    for (var i = 0, len = obj.length; i < len; i++) {
        ar2[i] = {}; // empty object to hold properties added below
        for (var prop in obj[i]) {
            if (
                prop === "idx" ||
                prop === "name" ||
                prop === "NodeDescription" ||
                prop === "custparents" ||
                prop === "_substeps" ||
                prop === "hidechildren" // new since 159a
            ) {
                ar2[i][prop] = obj[i][prop]; // copy properties from arObj to ar2
            }
            if (prop === "children" && obj[i][prop] !== null && obj[i][prop] !== false) {
                var theNewChildren = [];
                var theChildren = obj[i][prop];
                //console.log("theChildren")
                //console.log(theChildren)
                theChildren.forEach(function (d) {
                    //console.log("theChild")
                    //console.log([d])
                    var theNewKid = selectCopy([d]);

                    if (theNewKid[0][0] === undefined) {
                        var theNewKid2 = theNewKid[0];
                    } else {
                        var theNewKid2 = theNewKid[0][0];
                    }
                    //console.log("theNewKid")
                    //console.log(theNewKid2)
                    theNewChildren.push(theNewKid2);
                })
                ar2[i][prop] = theNewChildren;
            }//children
            if (prop === "_children" && obj[i][prop] !== null) {
                var theNewChildren = [];
                var theChildren = obj[i][prop];
                //console.log("_theChildren")
                //console.log(theChildren)
                theChildren.forEach(function (d) {
                    //console.log("_theChild")
                    //console.log([d])
                    var theNewKid = selectCopy([d]);

                    if (theNewKid[0][0] === undefined) {
                        var theNewKid2 = theNewKid[0];
                    } else {
                        var theNewKid2 = theNewKid[0][0];
                    }
                    //console.log("theNewKid")
                    //console.log(theNewKid2)
                    theNewChildren.push(theNewKid2);
                })
                ar2[i][prop] = theNewChildren;
            }//_children
            if (prop === "_subjson") {
                var theNewChildren = [];
                var theChildren = obj[i][prop];
                //console.log("theChildren")
                //console.log(theChildren)
                theChildren.forEach(function (d) {
                    //console.log("theChild")
                    //console.log([d])
                    var theNewKid = selectCopy([d]);

                    if (theNewKid[0][0] === undefined) {
                        var theNewKid2 = theNewKid[0];
                    } else {
                        var theNewKid2 = theNewKid[0][0];
                    }
                    //console.log("theNewKid")
                    //console.log(theNewKid[0][0])
                    theNewChildren.push(theNewKid2);
                })
                ar2[i][prop] = theNewChildren;
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
    d3.select('body').on('click.d3-context-menu', function () {
        d3.select('.d3-context-menu').style('display', 'none');
    });

    // this gets executed when a contextmenu event occurs
    return function (data, index) {
        var elm = this;

        d3.selectAll('.d3-context-menu').html('');
        var list = d3.selectAll('.d3-context-menu').append('ul');
        list.selectAll('li').data(menu).enter()
            .append('li')
            .html(function (d) {
                return (typeof d.title === 'string') ? d.title : d.title(data);
            })
            .on('click', function (d, i) {
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

function deleteNode(theNode) {
    //determine the parent of theNode
    var theParent = theNode.parent;
    // console.log('the new node before deleting ===')
    // console.log(theNode)
    //if the node has parent, find theNode as the children of its parent
    if (theParent !== undefined && theParent !== null) {
        for (i = 0; i < theParent.children.length; i++) {
            if (theParent.data.children[i].idx === theNode.data.idx) {//d3v4 (add .data)
                //console.log(i, theParent.children[i].idx)
                theParent.children.splice(i, 1) //use splice() only when there is ONE matched item
                theParent.data.children.splice(i, 1) //d3v4 //use splice() only when there is ONE matched item
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
function confirmDelete() {
    var del = confirm("Confirm to delete!");
    return del;
}

/**The above part is to delete a new node**************** */


/**The following part is  to creating a new node**************** */
function showCreateForm() {

    // Get the modal
    var modal = document.getElementById('theModal');

    // Get the button that opens the modal
    //var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementById("ModalClose");

    // When the user clicks on the button, open the modal 
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {

        //remove the modal
        modal.style.display = "none";
        $('#theModal').remove();

    }

    // When the user clicks anywhere outside of the modal, close it? no, do nothing
    window.onclick = function (event) {
        if (event.target !== modal) {
            //remove the modal
            //$('#theModal').remove();
        }
    }


}

function closeNewNodeModal() {
    document.getElementById('NewNode').style.display = "none";
}


function createNode() {

    // console.log(theParentToAppendChild) // it is defined in the var 'menu' (init.js). It is the data point of the node right clicked for creating node

    var name = $('#ModalInput').val();
    //create an uid for the new node
    var theUID = 'MY' + generateUUID();
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
            'idx': theUID,
            'name': name,
            'custparents': [
                { 'idx': theParentToAppendChild.data.idx }
            ]
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
    if ((theParentToAppendChild.children === undefined || theParentToAppendChild.children === null)
        && (theParentToAppendChild._children === undefined || theParentToAppendChild._children === null)
    ) {
        theParentToAppendChild.children = [];
        theParentToAppendChild.children.push(theNewKid); // if both .children and ._children are null or undefined
        theParentToAppendChild.data.children = [];
        theParentToAppendChild.data.children.push(theNewKid.data) // new in d3V4
    } else {
        if ((theParentToAppendChild.children === null || theParentToAppendChild.children === undefined)
            && theParentToAppendChild._children !== null && theParentToAppendChild._children !== undefined
        ) {
            theParentToAppendChild._children.push(theNewKid);	// if .children is null/undefined, but _children is not	
            theParentToAppendChild.data.children.push(theNewKid.data) // new in d3v4. hmm, in .data, it is always like data.children, nothing like data._children			
        } else {
            if (theParentToAppendChild.children !== null && theParentToAppendChild.children !== undefined) {
                theParentToAppendChild.children.push(theNewKid); // if ._children is null/undefined, but .children is not
                theParentToAppendChild.data.children.push(theNewKid.data) // new in d3V4
            } else {
                console.log("something is wrong, line 1751") // if both .children and ._children have things inside
            }
        }
    }

    //remove the modal
    $('#theModal').remove(); //modified from try89


    //do the make change tree macro, and also do the custline updateTree(theParentToAppendChild.tree_obj.dataroot)
    var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(theParentToAppendChild);
    pan()
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from
    // console.log('rootdatapoint_sortedrowscols ===')
    // console.log(rootdatapoint_sortedrowscols)


}

/**The above part is to creating a new node**************** */



/** the following part is to rename a node */
//https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal_bottom	
function showRenameForm() {

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
    span.onclick = function () {
        modal.style.display = "none";
        $('#theModal').remove();
    }

    // When the user clicks anywhere outside of the modal, close it? No, do nothing
    window.onclick = function (event) {
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
    var proposedTreesize = estTreesize(rootdatapoint_sortedrowscols)
    //   console.log(proposedTreesize.width, proposedTreesize.height)
    rootdatapoint_sortedrowscols.x0 = proposedTreesize.height / 2; // redefine the vertical middle point for position the root node
    // create the tree instance using proposed tree size (according for the changes made for show/hiding nodes)
    treeinstance = d3.tree().size([proposedTreesize.height, proposedTreesize.width]);
    updateTree = MakeChangeTree(theNodeToRename);
    pan()
    custlink(rootdatapoint_sortedrowscols, updateTree.nodeupdate); // add cross link, it should be separate from
}

/** the following part is to rename a node */





/**the following is related to create a modal for description editing */
function showInputTextForm() {

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
    var modalheader = modal.getElementsByClassName('modal-header')[0];

    modalcontentbox.style.width = "80%";
    modalcontentbox.style.height = "80%";

    // bring the quill toolbox and editor box into the modal's body part (div #DescInputBody)
    var DescInputBodyDom = document.getElementById("DescInputBody");
    // run makeQuill() to bring up the quill tool box and the editor box
    var modalToolboxID = 'modal-toolbox', modalEditorboxID = 'modal-editor';
    makeQuill(DescInputBodyDom, modalToolboxID, modalEditorboxID)


    /**Since commit 147a
     * blot formatter to resize image 
     * Blot formatter can be found at https://www.npmjs.com/package/quill-blot-formatter
     * Actually, only the quill-blot-formatter.min.js will be needed (as put in tools/quill/addon/quill-blot-formatter)
     * However, the individual file is not available on line. Following is the way to get it
     * 1) create a tmp folder in the local drive, e.g., f:try
     * 2) open node.js command window, change dir to the tmp folder (e.g., f:try), install quill 1.3.6 by typing
     *      'npm install quill@1.3.6'. 
     *      (see instruction of the NPM part at https://quilljs.com/docs/download/)
     *    quill has to be installed first, as when installing Blot formatter, it'll check whether a peer
     *      Quill (1.3.4 and above) has been installed. Without quill installed, it might report error and stop copying files to the local drive
     * 3) In the same tmp folder, type 'npm install --save quill-blot-formatter' to install the blot formatter files
     * 4) The 'quill-blot-formatter.min.js' can be found, in the above case, at 'F:\try\node_modules\quill-blot-formatter\dist'
     * 
     * In my case, I copied 'quill-blot-formatter.min.js' into tools/quill/qddon/quill-blot-formatter/, and cite it in index.html.
     * 
     * Next, in node.js command window, go to/stay in the tmp folder like 'F:try', type 'npm uninstall quill-blot-formatter' to uninstall it
     *  This will delete all files in F:\try\node_modules\quill-blot-formatter
     * Then, if uninstall quill 1.3.6 if you want (in my case, I'd uninstall it as I am not using it in npm way)
     * To uninsall it:
     * 1) rename the file F:\try\package-lock.json to package.json. 
     * 2) stay in F:try, type 'npm uninstall quill@1.3.6'
     * 
     * This will delete all files except the package.json, plus a newly created package-lock.json. 
     * 
     * Now it is fine to delete the tmp folder 'F:try' itself! close the node.js window. (Must! if it is open
     *  and stays in F:\try, that folder cannot be deleted). Go to windows explorer, delete the folder F:try.
     */

    //make a new instance of Quill
    var options = {
        modules: {
            toolbar: '#' + modalToolboxID,
            table: true,
            blotFormatter: {} // new since commit 147a for blot formatter 
        },
        placeholder: 'The is the default text...',
        theme: 'snow'
    }
    var quill_inmodal = new Quill('#' + modalEditorboxID, options);
    const table = quill_inmodal.getModule('table'); // new since commit 146a for table editing

    // new since commit 146a
    /**the following is inserted to enable table editing */
    DescInputBodyDom.querySelector('#insert-table').addEventListener('click', function () {
        table.insertTable(2, 2);
    });
    DescInputBodyDom.querySelector('#insert-row-above').addEventListener('click', function () {
        table.insertRowAbove();
    });
    DescInputBodyDom.querySelector('#insert-row-below').addEventListener('click', function () {
        table.insertRowBelow();
    });
    DescInputBodyDom.querySelector('#insert-column-left').addEventListener('click', function () {
        table.insertColumnLeft();
    });
    DescInputBodyDom.querySelector('#insert-column-right').addEventListener('click', function () {
        table.insertColumnRight();
    });
    DescInputBodyDom.querySelector('#delete-row').addEventListener('click', function () {
        table.deleteRow();
    });
    DescInputBodyDom.querySelector('#delete-column').addEventListener('click', function () {
        table.deleteColumn();
    });
    DescInputBodyDom.querySelector('#delete-table').addEventListener('click', function () {
        table.deleteTable();
    });

    /**the above is for table editing */

    // load existing NodeDescription, or enter a default text
    var thequillText;
    if (currentDataEle.data.NodeDescription !== undefined) {
        thequillText = currentDataEle.data.NodeDescription;
    } else {
        thequillText = "///t<br/>t///";
    }

    //get the quill modal editor box
    var editorbox_modal = d3.select('#' + modalEditorboxID)
    // console.log(modalcontentbox.getBoundingClientRect())
    // console.log(modalheader.getBoundingClientRect())
    // console.log(DescInputBodyDom.getBoundingClientRect())

    //delete padding of the modal-body box
    d3.select(DescInputBodyDom).styles({ "padding": "0px" })
    //get the toolbox
    var themodaltabletoolbox = document.getElementById('thetabletoolbox'); // new since commit 146a for table editing tools
    var themodaltoolbox = document.getElementById(modalToolboxID);
    d3.select(themodaltoolbox).style("background-color", "lightgrey")
    //Height of the modal body = Height of the diaglog box - height of the header 
    height_modalbody = modalcontentbox.getBoundingClientRect().height
        - modalheader.getBoundingClientRect().height
        - themodaltabletoolbox.getBoundingClientRect().height // new since commit 146a for table editing tools
        - themodaltoolbox.getBoundingClientRect().height


    editorbox_modal.styles({
        // 'background-color':'black',
        'max-height': height_modalbody + 'px',
        'min-height': '200px',
        "overflow": "auto",
        "font-family": "times new roman",//"Noto Serif",
        "font-size": "36px",
        "line-height": "16pt",
        "color": "black", // this is the place to change font color of the description box
        "margin": "0px",
        "position": "relative" // relative works for image resize, but not for link, fx, and video url
        // 'static' works for link/fx/video url, but not image resize
    })
    // .attrs({
    //     "contentEditable":"true"
    // }) // no need. If there is no error, the editor should be editable

    // editorbox_modal.html(thequillText)
    // quill_inmodal.setText(thequillText);
    // document.getElementById(modalEditorboxID).innerHTML = thequillText // wrong! it will cause the quill editor stop working
    quill_inmodal.clipboard.dangerouslyPasteHTML(0, thequillText); //use (0, ) not to use (5)

    quill_inmodal.on('text-change', function (delta, oldDelta, source) {
        // console.log('changed')
        // console.log(quill_inmodal.getText())
        //console.log(quill_inmodal.getContents()) // get a delta (a json like obj for the foramt jobs, only useful for quill)
        // console.log(quill_inmodal.root.innerHTML) 
        currentDataEle.data.NodeDescription = quill_inmodal.root.innerHTML
    });

    // console.log(currentDataEle.data.NodeDescription);

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {

        // if the modal is for editing NodeDesription, and the textviewbox is visible, update the text
        // get the idx of the current node description
        var thecurrentnodeidx = currentDataEle.data.idx
        var thecurrentnodecontents = currentDataEle.data.NodeDescription
        // check if the textviewbox is open
        var width_textviewbox = textviewbox.style('width')
        // console.log('width_textviewbox: ' +  width_textviewbox)
        if (width_textviewbox !== '0px') {

            //part 1: reload the textbox (that way, the new text spans are made)
            showSentences()

            //part 2: scroll down, to the text span corresponding to the node in which the node description was just changed

            // get all spans in textbox
            var showtextspanElms = $('span.showtext')
            for (var i = 0; i < showtextspanElms.length; i++) {
                // console.log(showtextspanElms[i])
                var thespantextidx = $(showtextspanElms[i]).attr('idx')
                // console.log(thespantextidx)
                // find the span with the same idx as the node in which the node description was just changed
                if (thespantextidx === thecurrentnodeidx) {

                    //highlight the selected span 
                    var theEle = showtextspanElms[i]
                    theEle.style.backgroundColor = "#C8C8C8"//"grey" //"#4677f8";
                    // theEle.style.color="#fefefe";
                    // theEle.style.outline = "5px solid grey"; //#66ff66

                    /**The idea is to find the first span, scroll it up to top. That way,
                     * all spans will always be scroll down starting from the top
                    */
                    // console.log('what is the clientrect.top of the first span element')
                    var firstElm = showtextspanElms[0]
                    var firstElmToTop = firstElm.getBoundingClientRect().top
                    // console.log(firstElm.getBoundingClientRect())

                    // scroll the first elm to top
                    $('#textBox').animate({
                        scrollTop: firstElmToTop
                    }, 0);

                    /**Now determine the relative vertical distance between the first and the current
                     *  span elms. This is the distance to scroll down
                     *  To show the target elm in the middle, offset the scroll distance by
                     *  half of the body height - the textviewbox to top (do not ask me why)
                     */
                    // console.log('theEle clientrect to top ')
                    var elmClientRectToTop = theEle.getBoundingClientRect().top
                    // console.log(elmClientRectToTop)

                    // console.log('the relative vertical distance between the current and the first')
                    //var relativeV = elmClientRectToTop - firstElmToTop // wrong! must use the most recent positions
                    var relativeV = theEle.getBoundingClientRect().top - firstElm.getBoundingClientRect().top
                    // console.log(relativeV)

                    //now scroll the elm down for that relative distance. 
                    $('#textBox').animate({
                        scrollTop: relativeV - (height_body / 2 - textviewbox.node().getBoundingClientRect().top)
                    }, 500);

                }
            }

        } // end if        

        modal.style.display = "none";

        //   //clean up the contents in both the main div, and the hidden textarea
        if (editorbox_modal !== undefined) {
            editorbox_modal.value = "";
            editorbox_modal.innerHTML = "";
        }

        $('#theModal').remove();// delete theModal;

    }

    // When the user clicks anywhere outside of the modal, close it // no, do nothing
    window.onclick = function (event) {
        if (event.target == modal) {
            // modal.style.display = "none";			
        }
    }

}//end of show input form


//the following two were used with nicEdit. They are not used after replacing nicEdit with Quill.
//best embedding formatted text editors (the NicEdit is the best). It was. Now quill seems to be a better option.
//https://smartbear.com/blog/develop/five-free-javascript-libraries-to-add-text-editing/
function InputTextChangeListener() {
    var myInputBox = document.getElementById("myInputBox");
    // console.log(myInputBox)
    myInputBox.addEventListener("input", function (event) { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        inputTextChangeUpdate();
    })
}

function inputTextChangeUpdate() {

    //nicEditors.findEditor('NicEdit').saveContent();
    // var theDivs=d3.selectAll("div")[0];// d3v3
    var theDivs = d3.selectAll("div")['_groups'][0]; // d3v4, [0][0] does not work!
    // console.log(theDivs)
    //find theDIV with the class name containing 'nicEdit-main'
    theDivs.forEach(function (d) {
        theClassName = d.className
        if (/nicEdit-button/i.test(theClassName)) {

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
        if (/nicEdit-main/i.test(theClassName)) {
            // console.log(d)
            //save d.innerHTML into currentDataEle as NodeDescription;
            theInputMainDiv = d;
            currentDataEle.data.NodeDescription = d.innerHTML
            // console.log(theInputMainDiv)
            // console.log(currentDataEle)
            theInputMainDiv.style.overflow = 'auto';
            theInputMainDiv.style.width = '100%';
            theInputMainDiv.style.height = '400px';
            theInputMainDiv.style.minHeight = '200px';
            //console.log(currentDataEle.data.NodeDescription)
        }
    })
}

/**the above is to create a modal for description editing */




//make a modal for adding a new node, rename a node, and description editing. The modal will be created and removed each time
function makemodal(id, title, label, action) {
    /**1.make a background
        this is to add a halfly transparent div on top of the current page. 
        It is to make a 'dim' effect of the whole page
    */
    var modalbackground = d3body
        .append('div')
        .attrs({ 'id': id, 'class': 'myModal' }) // id (e.g., theModal)

    /**2. within the background, create a dialog box 
     *  this is a box of the whole dialog area
    */
    var modaldialogbox = modalbackground.append('div').attrs({ 'class': 'modal-content' }) // this is a box of the whole dialog area
        .on('mousedown', d => { // the following is to prevent thetreeG moving when the mouse is down and moving within the modal area 
            event.stopPropagation();
        })
        .styles({
            "background-color": "lightgrey" // this is the place to change background color of the descritpion box 
        })

    /**3a. within the dialog box, create a header div */
    var modalheader = modaldialogbox.append('div').attrs({ 'class': 'modal-header' })

    /**3a.1 within the header, create a span as the modal close button*/
    var modalclosebutton = modalheader.append('span').attrs({ 'class': 'close', 'id': 'ModalClose' }).html('x')
    /**3a.2 within the header, create a h2 as the modal title*/
    var modalboxtitle = modalheader.append('h2').attr('id', 'modal-title').html(title) // modal header title ('e.g, Append a new node)

    /**3b. within the dialog box, create the body div */
    var modalbody = modaldialogbox.append('div').attrs({ 'class': 'modal-body' })

    // if 'title' is 'Description' make the description type modal, else make a type for rename, del, new node, etc.
    if (title === 'Description') {
        //change the modal boxtitle by adding the title
        modalboxtitle.html(title + ": " + currentDataEle.data.name)
        modalbody.attrs({ 'id': 'DescInputBody' }).styles({ "overflow": "auto;" })

    } else { //make a type of modal for rename, del, new node, etc

        /**3b1. within the body box, create the body title h2 */
        // var modalbodytitle = modalbody.append('h2').attrs({'id': 'modalTitle'}).html('Create Node')  // modal body title

        /**3b2. within the body box, create a div to hold rows that appears in the body */
        var modalbodyrow = modalbody.append('div').attrs({ 'class': 'row' })

        /**3b2a. within the body row div, create a div to hold body row contents */
        var modalbodyrowcontents = modalbodyrow.append('div').attrs({ 'class': 'large-12 columns' })

        /**3b2a1. within the body row contents div, create a label to indicate 'Node name' */
        var modalbodyrowcontentslabel = modalbodyrowcontents.append('label').text(label)  // prompt str, e.g 'Node name'
        /**3b2a1a. within the body row contents label, create an input DOM element to indicate 'Node name' */
        var modalbodyrowcontentslabelinput = modalbodyrowcontentslabel.append('input')
            .attrs({ 'type': 'text', 'class': 'inputName', 'id': 'ModalInput' }) //CreateNodeName
            .styles({ 'placehoder': 'node name', 'width': '80%' })

        // add a listener, when the enter key is pressed and is keyup, click the ok button
        modalbodyrowcontentslabelinput.node().addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                document.getElementById("modalokbutoon").click();
            }
        });

        /**3b2a1b. within the body row contents label, create a button to submit input */
        var modalbodyrowcontentslabelbutton = modalbodyrowcontentslabel.append('button')
            .attrs({ 'onclick': action, 'id': 'modalokbutoon' }) // e.g.,'createNode()' 
            .text('OK')
    }
}


//check if the data ele contains nodeDescription, and the nodeDescription contains [to do]
function checkToDo(dataEle) {
    var theNodeDesc;
    if (dataEle.data.NodeDescription) { theNodeDesc = dataEle.data.NodeDescription }; //d3v4
    var theResult = 0;
    if (theNodeDesc !== undefined && /\[to Do\]/i.test(theNodeDesc)) {
        //		console.log(/\[to Do\]/i.test(theNodeDesc));
        theResult = 1;
    }
    return theResult;
}



/**The following is to show textbox and link text to treenode *************************** */

//get the text beween tags (e.g., ///t t///)
function getContentsBetweenTags(d, tags) {

    var starttag = tags[0], endtag = tags[1];

    // set the default result = ''
    var result = '';

    //check if the text contains the start delimiter
    if (d.includes(starttag)) {
        // get the text segment after the start tag (e.g., '///t'...)
        var textseg1 = d.split(starttag)[1]
        //check if the text contains the end delimiter
        if (d.includes(endtag)) {
            result = textseg1.split(endtag)[0].trim()
        }
    }
    return result
}


//recursively get sentences to show (betweeen ///t and t///) from nodedescription
function getNodeSentences(obj) {
    //console.log(obj)
    var result = []; // create empty array to hold copy
    //revised, get the contents between ///t t///
    if (obj.data.NodeDescription !== undefined) { //d3v4
        // get the text between ///t and t///
        var theTmpNodeContents = getContentsBetweenTags(obj.data.NodeDescription, ['///t', 't///']) //d3v4
        // console.log('theTmpNodeContents of ' + obj.data.idx)
        // console.log(theTmpNodeContents)
        // if the contents is not '', get the idx
        if (theTmpNodeContents !== '') {
            // get the idx
            var theTmpidx = obj.data.idx;
            // make a map of .idx, and .content
            var theTmp = { 'idx': theTmpidx, 'content': theTmpNodeContents };
            // push the map into the result array
            // console.log(theTmp)
            result.push(theTmp)
        }
    }

    //if there are children nodes
    if (obj.children !== null & obj.children !== undefined) {
        var theChildren = obj.children;
        // console.log("theChildren")
        // console.log(theChildren)
        theChildren.forEach(function (d) {
            // console.log("theChild")
            // console.log(d)
            var result_children = getNodeSentences(d);
            // console.log("result_children")
            // console.log(result_children)           
            //push each ele in result_children into result
            result_children.forEach(function (e) {
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

//change the contents: replacing <div></div> by <br/>
function replaceDIVbyBR(d) {

    // set the default result = ''
    var result = '';
    // replace <div> with nothing
    stripdiv = d.replace(/(<div>)/gmi, '') //g for global (change all matched not the first); m for multiple line; i for ignoring case (whether DIV or div)
    // replace </div> with a line breaker </br>
    result = stripdiv.replace(/<\/div>'/gmi, '<br/>')

    return result
}

//change the contents: replacing <p></p> by <br/>
function replacePbyBR(d) {

    // set the default result = ''
    var result = '';
    // replace <div> with nothing
    stripdiv = d.replace(/(<p>)/gmi, '') //g for global (change all matched not the first); m for multiple line; i for ignoring case (whether DIV or div)
    // replace </div> with a line breaker </br>
    result = stripdiv.replace(/<\/p>'/gmi, '<br/>')

    return result
}



function showSentences() {

    //check the width of the textviewbox, if it is not 0, stay with the current width
    if ($('.textviewbox').width() !== 0) {
        width_textviewbox = $('.textviewbox').width
    } else {
        $('.textviewbox').width(width_textviewbox);
    }


    //display the textBox and the hintBox
    $("#textBox").css('display', "block");
    $("#textBox").css('height', "auto");
    $("#hintBox").css('display', "block");
    $("#hintBox").css('height', "auto");

    //empty all contents (the text, the child and other descendant elements)
    $("#textBox").empty()

    //get the sentences (recursively search each node, and get description html from the nodes without descendant elements)
    var theContents = getNodeSentences(rootdatapoint_sortedrowscols);
    // console.log(rootdatapoint_sortedrowscols)
    // console.log(theContents)
    theContents.forEach(function (d) {
        // console.log(d)
        /**The .content by nicEdit/Quill is in html format
         * Lines of contents are put in separate divs, except that if there is only one line
         *  (e.g., ///t <thecontents> t///). In case of just having one line, there is no div wrapping .thecontents. 
         */
        // the problem is that <div> or <p> force the sentences to change line. The solution is to strip the div, and replace with </br>. 
        // That way, sentences without <div> will be put in one line by <span> (in node description's show text part, not indicated to change line), 
        cleanedContent = replaceDIVbyBR(d.content)
        cleanedContent = replacePbyBR(d.content)
        // console.log(cleanedContent)
        var theSentenceHTML =
            "<span idx='" + d.idx + "' class='showtext'" + "onmouseover='onsentencehover(this)'"
            + "onmouseout='onsentenceout(this)'>"
            + cleanedContent
            + "&nbsp</span>";

        $("#textBox").append(theSentenceHTML)
    });

    //ctrl left click to lock
    CtrlClickToLock();

    // listen to changes in the text box
    ShowSentenceChangeListener()

}// end showSentences()

/** the following are related to lock of nodes when a span jof show text is selected by ctrl-click */
// when the show text is clicked, run showtextonclick
function CtrlClickToLock() {
    // thetextbox.selectAll('span.showtext')
    //changed, so it can lock text for both in thetextbox or in the search box
    d3.selectAll('span.showtext')
        .on('click', showtextonclick)
}
//check the mouse key, if it is ctrl-unknown (a ctrl-click, toggle the locknode status)
function showtextonclick() {

    // console.log('a show text span was clicked')
    var themousekey = getmousekey()
    // console.log('themousekey ======')
    // console.log(themousekey)
    //for click, the last mouse action is mouse up. For mouse up, the mouse button is 'unknown'
    //therefore ctrl-click indeed returns: ctrl-unknown
    if (themousekey === 'ctrl-unknown') {
        if (locknode === 1) { locknode = 0 } else { locknode = 1 };
        // console.log('the node lock status = ' + locknode)
    }
}
/**the above are related to lock of nodes when a span of show text is selected by ctrl-click */



// on sentencehover, centerize the node in the tree diagram
function onsentencehover(theEle) {

    //only take actions if the locknode status is not 1
    if (locknode != 1) {

        // change color of the selected text (to highlight)
        theEle.style.backgroundColor = '#C8C8C8' //"grey" //"#4677f8";
        // theEle.style.color="#fefefe";
        // theEle.style.outline = "5px solid grey"; //#66ff66
        var theidx = $(theEle).attr('idx')
        // console.log('theidx')
        // console.log(theidx)

        //according to idx, get the node obj containing .idx, .data, .elm, and .d3obj 
        var theTreeNode = getNodeByIdx(theidx)
        // console.log(theTreeNode)
        if (theTreeNode.idx !== null) {
            //enlarge the node circle, make the text bold with box
            theTreeNode.d3obj.select('circle')
                .styles({ 'fill': "lightgrey" })
                .attrs({
                    "stroke-width": nodecircle_border_width * 2,
                    "r": nodecircle_radius * 2
                })


            CentralNode_selectedText(theTreeNode.data)

            //show hint text for the selected idx
            ShowHintText(theTreeNode.data)
        } // only do it when it can be found
    }
}


//on mouse moving out of the sentence, unhighlight the sentence, and returnt the circle to normal
function onsentenceout(theEle) {

    //only take actions if the locknode status is not 1
    if (locknode != 1) {

        theEle.style.backgroundColor = "initial";
        theEle.style.color = "initial";
        theEle.style.outline = "initial";
        var theidx = $(theEle).attr('idx')

        //according to idx, get the node obj containing .idx, .data, .elm, and .d3obj 
        var theTreeNode = getNodeByIdx(theidx)
        // console.log(theTreeNode)
        if (theTreeNode.idx !== null) {
            //enlarge the node circle, make the text bold with box
            theTreeNode.d3obj.select('circle')
                .style('fill', function (d) {
                    return d._children ? nodecircle_fill_hidedescendants_color : nodecircle_fill_showdescendants_color;
                })
                .attrs({
                    "stroke-width": nodecircle_border_width,
                    "r": nodecircle_radius
                });
        }
    }
}


// according to idx, find the node DOM ele, the node d3data, and the node data
function getNodeByIdx(theidx) {

    // set default result
    var result = {
        'idx': null,
        'data': null,
        'elm': null,
        'd3obj': null
    }
    //find the node(its attr (idx = d.idx), this is done by d3v4.
    //loop for all datapoints binding to a nodeG
    var thenodeD3Objs = thetreeG.selectAll('g.nodeGs')
    // console.log('thenodeD3Objs')
    // console.log(thenodeD3Objs)

    thenodeD3Objs.attr('fakeattr', (e, i) => {
        if (e.data.idx === theidx) { //d3v4
            var theNodeData = e
            var theNodeDOMEle = thenodeD3Objs['_groups'][0][i] // d3v4
            var theNodeD3Obj = d3.select(theNodeDOMEle)
            result = {
                'idx': theidx,
                'data': theNodeData,
                'elm': theNodeDOMEle,
                'd3obj': theNodeD3Obj
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
function CentralNode_selectedText(d) {

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
    var translate_mapUpperLeft = 'translate (' + 400 + ',' + currentsvgh / 2 + ')'


    //5.1.4 determine the string for enlarge/shrink (scale)
    var scaleStr = 'scale (' + zoomLevel + ')'

    //5.1.5 determine the offset 
    var translate_offsetSelectedPath = 'translate (' + -x + ',' + -y + ')'

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

function ShowSentenceChangeListener() {

    // 1) save the current innerHTML of the <span> elements 
    var theSpans_beforChange = document.getElementsByClassName("showtext");
    //push the contents into an array
    var _contentsBeforeChange = [];
    for (i = 0; i < theSpans_beforChange.length; i++) { //forEach does not work for html collections
        _contentsBeforeChange.push({
            'idx': theSpans_beforChange[i].getAttribute('idx'), // this is the plain js way of getting attribute
            'content': theSpans_beforChange[i].innerHTML
        })
    }
    // console.log(_contentsBeforeChange)

    // 2) detect change
    thetextbox.node().addEventListener("input", d => { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        on_textBoxInput()
    })

    // 3 to 6, on change
    function on_textBoxInput() {
        //3) find which span element has changed value
        theSpans_afterChange = document.getElementsByClassName("showtext");
        for (i = 0; i < theSpans_afterChange.length; i++) { //forEach does not work for html collections
            var theidx = theSpans_afterChange[i].getAttribute('idx') // this is the plain js way of getting attribute
            var thecontent_afterchange = theSpans_afterChange[i].innerHTML

            //3.1 find the content of the same idx before change
            var thecontent_beforechange;
            _contentsBeforeChange.forEach((h) => {
                if (h.idx === theidx) { thecontent_beforechange = h.content }
            })
            // 3.2 check if the content has changed 
            if (thecontent_beforechange !== undefined && thecontent_beforechange !== thecontent_afterchange) {
                // 3.3 replace the content changed before by the current content
                thecontent_beforechange = thecontent_afterchange
                // 4) get the idx of the span with changed content, which is theidx
                // 5) find the corresponding tree node of the same .data.idx
                var theNode = getNodeByIdx(theidx)
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
                var theNodeDesc_changed = theNodeDesc.replace(theNodeDescTextSeg, ('///t' + thecontent_afterchange + 't///'))
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
    theNodeDesc = d.data.NodeDescription
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
    var theHintHTML = "<span idx='" + d.data.idx + "' class='hinttext' >" + thehintstr + "</span>";
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

function HintChangeListener() {

    // 1) save the current innerHTML of the <span> elements 
    var theSpans_beforChange = document.getElementsByClassName("hinttext");
    //push the contents into an array
    var _contentsBeforeChange = [];
    for (i = 0; i < theSpans_beforChange.length; i++) { //forEach does not work for html collections
        _contentsBeforeChange.push({
            'idx': theSpans_beforChange[i].getAttribute('idx'), // this is the plain js way of getting attribute
            'content': theSpans_beforChange[i].innerHTML
        })
    }
    // console.log(_contentsBeforeChange)

    // 2) detect change
    thehintbox.node().addEventListener("input", d => { //use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
        on_hintBoxInput()
    })

    // 3 to 6, on change
    function on_hintBoxInput() {
        //3) find which span element has changed value
        theSpans_afterChange = document.getElementsByClassName("hinttext");
        for (i = 0; i < theSpans_afterChange.length; i++) { //forEach does not work for html collections
            var theidx = theSpans_afterChange[i].getAttribute('idx') // this is the plain js way of getting attribute
            var thecontent_afterchange = theSpans_afterChange[i].innerHTML

            //3.1 find the content of the same idx before change
            var thecontent_beforechange;
            _contentsBeforeChange.forEach((h) => {
                if (h.idx === theidx) { thecontent_beforechange = h.content }
            })
            // 3.2 check if the content has changed 
            if (thecontent_beforechange !== undefined && thecontent_beforechange !== thecontent_afterchange) {
                // 3.3 replace the content changed before by the current content
                thecontent_beforechange = thecontent_afterchange
                // 4) get the idx of the span with changed content, which is theidx
                // 5) find the corresponding tree node of the same .data.idx
                var theNode = getNodeByIdx(theidx)
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
                var theNodeDesc_changed1 = theNodeDesc.replace(theNodeDescTextSeg1, '')
                //replace the hint text between ne tag with nothing.
                var theNodeDesc_changed2 = theNodeDesc_changed1.replace(theNodeDescTextSeg2, '')
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
function hideSentences() {
    $("#textBox").hide();
    $("#hintBox").hide();
    $('.textviewbox').width(0);
}




//ZoomInOutSelectedNode: zoom in out the selected note
function ZoomInTree() {
    //disable the default right click menu
    d3.event.preventDefault();
    zoomLevel = zoomLevel * 1.5; //zoomLevel is a global var, saving the current zoomLevel
    var scaleStr = 'scale (' + zoomLevel + ')'
    thetreeG.transition()
        .duration(zoomSettings.duration)
        .ease(zoomSettings.ease)
        .attr('transform', scaleStr)
        ;
} // end ZoomInTree()
//ZoomInOutSelectedNode: zoom in out the selected note
function ZoomOutTree() {
    //disable the default right click menu
    d3.event.preventDefault();
    zoomLevel = zoomLevel / 1.5; //zoomLevel is a global var, saving the current zoomLevel
    //if (zoomLevel <= 0){zoomLevel=1}
    var scaleStr = 'scale (' + zoomLevel + ')'
    thetreeG.transition()
        .duration(zoomSettings.duration)
        .ease(zoomSettings.ease)
        .attr('transform', scaleStr)
        ;

} // end ZoomOutTree()


// The following is an example to get html contents from URL, and save as a treeJason file
function getHtmlAsTreeJSON() {

    /* to get text from a URL and change it into a JSON obj
    data is from https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12
    the contents are components after the h1 dom elements: CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.
    There are two types of ele: <p> and <pre>, each for normal text, and proverbs in french.
    */

    //1. fetch the dom from the url
    // to solve the cors problem !!! must have
    //https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
    var ExternalURL = "https://cors-anywhere.herokuapp.com/https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12"

    var thehtmlstr; var textDOMEles;
    $.ajax(ExternalURL, {
        success: function (data) {
            $('#tmpbox').html($(data).find('#tmpbox *'));
            console.log('The page has been successfully loaded');
            setTimeout(function () {
                // console.log(thehtmlstr)
                //parse html str as DOM elements
                textDOMEles = $.parseHTML(thehtmlstr)
                // console.log(textDOMEles)
                // get the elments after the h1/'CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.'
                var startCatching = 0, textArray = [];
                //find the h2 with text 'CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.'
                i = 0
                textDOMEles.forEach(elm => {
                    if ($(elm).is('h1') && $(elm).text().includes('CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.')) { //
                        startCatching = 1
                        // console.log($(elm).text())
                    }
                    //after startCatching = 1, catch contents in <p>, and <pre>
                    if (startCatching === 1 && ($(elm).is('p') || $(elm).is('pre'))) {

                        var thetxt = $(elm).text().trim()
                        //split the text by period. This is to have sentences at large.
                        var thetxtArr = thetxt.split('.')
                        thetxtArr.forEach(d => {
                            tmpnode = {
                                'idx': generateUUID(),
                                'name': i++,
                                'NodeDescription': '///t <br/>' + d + '.<br/> t///'
                            }
                            textArray.push(tmpnode)
                        })
                    }
                })
                // console.log(textArray)

                //finally, rep textArray will a parent node
                var thebook = [{
                    'idx': generateUUID(),
                    'name': 'chapter12',
                    'children': textArray
                }]
                // console.log(thebook)

                NewTree(thebook)

            }, 3000
            );
            thehtmlstr = data;
        },
        error: function () {
            console.log('An error occurred');
        }
    });

}

// The following is an example to get text contents from URL, and save as a treeJason file
function getTextAsTreeJSON() {

    /* to get text from a URL and change it into a JSON obj
    data is from https://www.gutenberg.org/files/3600/3600-h/3600-h.htm#chap12
    the contents are components after the h1 dom elements: CHAPTER XII. — APOLOGY FOR RAIMOND SEBOND.
    There are two types of ele: <p> and <pre>, each for normal text, and proverbs in french.
    */

    //1. fetch the dom from the url
    // to solve the cors problem
    //https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
    var ExternalURL = "data/chapter12.txt"

    var thehtmlstr; var textDOMEles;
    $.ajax(ExternalURL, {
        success: function (data) {
            // $('#tmpbox').html($(data).find('#tmpbox *'));
            console.log('The page has been successfully loaded');
            setTimeout(function () {
                thehtmlstr = data
                console.log(thehtmlstr)
                textArray = thehtmlstr.split('—');
                var i = 0; var nodesarray = [];
                textArray.forEach(d => {
                    tmpnode = {
                        'idx': generateUUID(),
                        'name': i++,
                        'NodeDescription': '///t <br/>' + d + '<br/> t///'
                    }
                    nodesarray.push(tmpnode)
                })
                // console.log(textArray)

                //finally, prepare a book array with idx, name, and the nodesarray 
                var thebook = [{
                    'idx': generateUUID(),
                    'name': 'chapter12',
                    'children': nodesarray
                }]
                console.log(thebook)
                NewTree(thebook)
            }, 3000
            );
        },
        error: function () {
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
        blob = new Blob([srcfilecontent], { type: "octet/stream" }),
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
function ImportFromEGPAfterReloading(d) {

    //initialize the root parent
    var therootparent;

    // console.log(d)
    //https://stackoverflow.com/questions/32267930/get-name-of-files-of-zip-file-in-javascript
    var thezipfile = d.files[0];
    // console.log(thezipfile)
    var reader = new FileReader();
    reader.readAsBinaryString(thezipfile);

    reader.onloadend = function (e) {
        var myZip = e.target.result;
        var unzipper = new JSUnzip(myZip);

        unzipper.readEntries();

        //myFiles, or the entries contains a flatterned list of files, in which
        // the .fileName contains filePath and fileName in the
        var myFiles = unzipper.entries;

        for (var i = 0; i < myFiles.length; i++) {

            var name = myFiles[i].fileName; // This is the file name
            // console.log( myFiles[i].fileName)

            //find the file 'project.xml' and extract its content as html DOM
            if (name === 'project.xml') {

                var content = JSInflate.inflate(myFiles[i].data); // this is the content of the files within the zip file.

                //remove the non printable characters (indeed the non ascII chars)
                var rcontent = content.replace(/[^\x20-\x7E]/g, ''); //!!!! must have, as the original content contains non-printable characters which cause error when transferrring to html DOM
                //replace \ with \_. This is to prevent errors caused by backslash
                rcontent = rcontent.replace(/\\/g, '\\_');

                //The xml sucks, instead, import the rcontent str as HTMLDOM
                var htmlDoc = $.parseHTML(rcontent)
                // console.log($(htmlDoc)) // the node 'projectcollection' contains all relavant info

                htmlDoc.forEach(elm => {
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
                        var splitArrays = getDefaultCustLinks(linksarray, tasksarray)
                        var defaultlinksarray = splitArrays.defaultlinks;
                        var custlinksarray = splitArrays.custlinks;
                        // console.log(defaultlinksarray)
                        // console.log(custlinksarray)

                        //3) for each task, determine .children .custparents
                        therootparent = getTaskChildrenCustparents(tasksarray, defaultlinksarray, custlinksarray, therootparent);
                        console.log(therootparent)

                        //4) make substep nodes for each task node
                        //throotparent = addSubSteps(therootparent)// too many, the system will blowout!!!

                        //To this step, the treeJSON is ready, which is therootparent! Make a tree with therootparent
                        NewTree(therootparent)

                        // collapseAll(rootdatapoint_sortedrowscols)

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
function getLinksToTasks(tasksarray, all_links) {
    // get an array of idx from tasksarray
    var idx_array_tasks = tasksarray.map(obj => obj.idx)
    // console.log(idx_array_tasks)
    var theLinksToTasks = []; // Note!!!! do not use splice(i,1) It'll mess up the order of the items in the array
    // instead, create a new array and add qualified items into the new array

    all_links.forEach((al, i) => {
        // if the to/from idx of the current link cannot be found in idx_array_tasks, delete the link
        if (idx_array_tasks.indexOf(al.to) === -1 || idx_array_tasks.indexOf(al.from) === -1) {
            // console.log('the following link is not to/from a task and is deleted')
            // console.log(al)
        } else {
            theLinksToTasks.push(all_links[i])
        }
    })
    // console.log(theLinksToTasks.length)
    return theLinksToTasks
}



/**For each task in taskarray, determine .childrens, and .custparents */
function getTaskChildrenCustparents(tasksarray, defaultlinksarray, custlinksarray, therootparent) {
    // console.log(tasksarray)
    //Part 1: loop for each task in tasksarray:
    tasksarray.forEach(t => {
        t.children = [], t.custparents = [];
        /**The following is to determine .children, .custparents, and .bornparent*/

        // A. loop for each defaultlink item to determine the bornparent, and the children of the current task
        defaultlinksarray.forEach((dl, i) => {

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
            if (t.idx === dl.to) {
                // get an array of idx from tasksarray
                var idx_array_tasks = tasksarray.map(obj => obj.idx)
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
            if (t.idx === dl.from) {

                //use the idx in dl.to of the current dl, get the corresponding item in taskarray. 
                //This is the task which is a child of the current t                
                var thechildtask = tasksarray[tasksarray.map(obj => obj.idx).indexOf(dl.to)]
                // the DOM from egp is quite messed up. sometimes a .to idx in a link cannot be matched 
                // to idx of any task
                if (thechildtask === undefined) {
                    console.log('hey something is wrong !!!' + i)
                    console.log(t)
                    console.log(dl)
                } else {
                    // push the child task into t.children
                    t.children.push(thechildtask)
                }
            }

        })
        // B. loop for each custlinksarray item to determine the idx (this time, idx only) of a custparent
        custlinksarray.forEach(cl => {

            /* 1) to determine .custparent:
            *  a. loop for the custlinksarray for idx in '.to' as the same as t.idx
            *      such a link from custlinksarray tells that the current task is a child in that link
            *  b. for the link identified in step a., the idx in '.from' is the idx of a custparent of the current task
            *  c. push the idx found in b into t.custparents. .custparents is an array of idx. 
            *       Unlike .bornparent, or .children, .custparents only contain idx, no other properties are required
            * Note: for each task, there is multiple item that can be found by step a.
            */
            if (t.idx === cl.to) {
                // push dl.from into t.custparients
                t.custparents.push({ "idx": cl.from })
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
    tasksarray.forEach(t => {
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
        if (t.children.length === 0) { delete t.children }
        if (t.custparents.length === 0) { delete t.custparents }
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
function getDefaultCustLinks(srclinks, tasksarray) {

    var theDefaultlinks = [], theCustlinks = [];
    var last_linkto;

    /**The links should be sorted by names
     * from a2 to b1
     * from a1 to b1
     * from a2 to b2
     * from a1 to b2
     * 
     * First, the links should be sorted by .to names
     * a2 => b1
     * a1 => b1
     * a1 => b2
     * a2 => b2
     * 
     * Next, the links should be sorted by .from names 
     * a1 => b1
     * a2 => b1
     * a1 => b2
     * a2 => b2
     * 
     * That way, the names in lowest alphabetic order will be used as the default link. This is in line with
     * the usual ways by which the programs are named.
     * 
     */

    //1. add names from the taskarray into the links array (in EGP files, node lables, and links are saved separately. Therefore there is
    // no name data in links)
    var tmp1 = [];
    srclinks.forEach(d => {
        // the task name with the same idx as d.idx(in srclinks)
        var toName = tasksarray[tasksarray.map(obj => obj.idx).indexOf(d.to)].name
        var fromName = tasksarray[tasksarray.map(obj => obj.idx).indexOf(d.from)].name
        tmp1.push(
            {
                to: { idx: d.to, name: toName },
                from: { idx: d.from, name: fromName }
            })
    })

    //2. make a sorting for tmp1 by multiple fields. first sort by .to.name; second, sort by .from.name
    // the following solusion is pretty neat, from https://stackoverflow.com/questions/13211709/javascript-sort-array-by-multiple-number-fields
    var tmp2 = tmp1.sort(function (a, b) {
        return a.to.name - b.to.name || a.from.name - b.from.name;
    });


    //split the links into default links, and customized links.
    // The allocation of default/customized links are quite arbituary, but it does not matter, as the
    // relationship of these nodes can be changed in the tree map. 
    var distinctlinkto = [];
    tmp2.forEach(function (d) {
        //if the linkto is the same as the previous, add it to the customized links array
        // throw the names, make the target array items like {from:'', to:''}

        // changed, the default links array contains the first link for .to node, 
        //but the custlink array contains all links! That way, later when changing parent in tree map, 
        //none of the existing relationship will be lost
        theCustlinks.push({ from: d.from.idx, to: d.to.idx });
        if (distinctlinkto.includes(d.to.idx)) {
            // do nothing
        } else {
            //if the linkto is new, add it to the default links array
            theDefaultlinks.push({ to: d.to.idx, from: d.from.idx });
            distinctlinkto.push(d.to.idx);
        }
    })

    // console.log(tasksarray)
    // console.log(srclinks)
    // console.log(tmp1)
    // console.log(tmp2)
    // console.log(theDefaultlinks)
    // console.log(theCustlinks)

    // return {'defaultlinks': theDefaultlinks,'custlinks': theCustlinks} 
    return { 'defaultlinks': theDefaultlinks, 'custlinks': theCustlinks }
    // changed, the default links array contains the first link for .to node, 
    //but the custlink array contains all links! That way, later when changing parent in tree map, 
    //none of the existing relationship will be lost
} // end getDefaultCustLinks


function egpLinksToArray(theDom) {

    var ProjectCollectionElements = theDom.getElementsByTagName("Element"); //[0].children;

    // console.log(ProjectCollectionElements)	

    //get the elements as a d3 array, each for an element 
    var ProjectCollectionLinks = [];
    var eleLength = ProjectCollectionElements.length;
    var i = 0;
    while (i < eleLength) {
        //get the element's type
        theElement = ProjectCollectionElements[i];
        var theEleType = d3.select(theElement).attr("Type");
        //console.log(theEleType);
        if (theEleType === "SAS.EG.ProjectElements.Link") {
            //display label
            // console.log(theElement.children[0].children[0].innerHTML)

            //get the theLinkLogs
            var theLinkLogs = theElement.getElementsByTagName("Log")[0];
            //console.log(theLinkLogs)
            //get LinkedFrom TaskID
            var theLinkedFromTaskID = theLinkLogs.getElementsByTagName("LinkFrom")[0].innerHTML; //Label, the index number may change
            //console.log(theLinkedFromTaskID)
            var theLinkedToTaskID = theLinkLogs.getElementsByTagName("LinkTo")[0].innerHTML; //ID, the number may change
            //console.log(theLinkedToTaskID)
            var theLink = { from: theLinkedFromTaskID, to: theLinkedToTaskID };
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
function egpTasksToArray(theDom) {

    // console.log (theDom)

    //get the project collection elements (tasks, note, etc.)
    // these elements are wrapped in the dom element <Elements></Elements>
    //var ProjectCollectionElements=d3.select(ProjectCollection.children[11].children)[0][0];//the index number 11 may change ... so better to get Elements by TagName
    var ProjectCollectionElements = theDom.getElementsByTagName("Elements")[0].children;

    //console.log(ProjectCollectionElements)	

    //get the elements as a array, each for an element 
    var ProjectCollectionTasks = [];
    var eleLength = ProjectCollectionElements.length;
    var i = 0;
    while (i < eleLength) {
        //get the element's type
        theElement = ProjectCollectionElements[i];
        var theEleType = d3.select(theElement).attr("Type");
        //console.log(theEleType);
        if (theEleType === "SAS.EG.ProjectElements.CodeTask"
            ||
            theEleType === "SAS.EG.ProjectElements.EGTask"
            ||
            theEleType === "SAS.EG.ProjectElements.Note"
        ) {
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
            var theTaskLabel = theTaskProperties.getElementsByTagName("Label")[0].innerHTML; //Label, the index number may change
            //console.log(theTaskLabel)
            var theTaskID = theTaskProperties.getElementsByTagName("ID")[0].innerHTML; //ID, the number may change
            //console.log(theTaskID)
            var theTaskType = theTaskProperties.getElementsByTagName("Type")[0].innerHTML;

            //If the task is a note, its contents are within the tag
            if (theTaskType === "NOTE") {
                theNoteContent = theElement.getElementsByTagName("Text")[0].innerHTML;
                var theNoteContent = theNoteContent.replace(/\r\n|\r|\n/gm, '<br/>') // must have, replace line break with html linebreaker symbols
                var theNoteContent = theNoteContent.replace(/(&lt;)/g, '<')
                var theNoteContent = theNoteContent.replace(/(&gt;)/g, ">") //
                var theNoteContent = theNoteContent.replace(/;/gm, '&#59')
                var theNoteContent = theNoteContent.replace(/\t/gm, '&nbsp&nbsp&nbsp&nbsp')
                var theNoteContent = theNoteContent.replace(/ /g, "&nbsp")
                var theNoteContent = '///t<br/>' + theNoteContent + '<br/>t///'
                // console.log('theNoteContent')
                // console.log(theNoteContent)
                // console.log(theNoteContent6)
                var theTask = {
                    idx: theTaskID, name: theTaskLabel, type: theTaskType,
                    NodeDescription: theNoteContent
                };
            } else {
                var theTask = { idx: theTaskID, name: theTaskLabel, type: theTaskType };
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
function getTaskContents(srcarray, filesInZip) {

    srcarray.forEach(d => {
        /** in SAS egp, a task file (usually called a program) contains SAS code and 
         * comments of the task. both the task content file, and the task itself shares the same id.
         * specifically, the task file in the epg zip is named by the following rules:
         * <id of the task> + '/code.sas'
         * determine the file with contents of the task */
        theidx = d.idx
        // so the content file is:
        thesascodefiletosearch = theidx + '/code.sas'

        //loop for each file in filesInZip see if there is a matched file
        for (var i = 0; i < filesInZip.length; i++) {
            var thefilename = filesInZip[i].fileName; // This is the file name
            if (thefilename === thesascodefiletosearch) {
                // console.log('matched file found ============')
                // console.log(thefilename)
                var content = JSInflate.inflate(filesInZip[i].data);
                var rcontent1 = content.substring(1, 2)
                //the first 2 char are often non-printable characters. If so, delete them
                var rcontent1a = rcontent1.replace(/[^ -~]+/g, ''); //!!!! must have
                var rcontent2a = content.substring(3).replace(/\r\n|\r|\n/gm, '<br/>') // must have, replace line break with html linebreaker symbols
                var rcontent2b = rcontent2a.replace(/;/gm, '&#59')
                var rcontent2c = rcontent2b.replace(/\t/gm, '&nbsp&nbsp&nbsp&nbsp')
                var rcontent = rcontent1a + rcontent2c
                // console.log(rcontent)
                d.NodeDescription = '///t<br/>///s<br/>' + rcontent + '<br/>s///<br/>t///'

            }
        } // end for loop

    })
    // console.log(srcarray)
    return srcarray
} // end of getTaskContents

/**The above is related to handling egp to treeJSON *******************/


/**The following is to resize of treeviewbox, and  textviewbox (tested, works for chrome, and firefox)*/
function observetreeviewboxsize() {
    //when the treeviewbox changed, check it's size
    //https://alligator.io/js/resize-observer/
    const myObserver = new ResizeObserver(entries => {
        // iterate over the entries, do something.
        entries.forEach(entry => {

            //update the textviewbox, svg size, and the rect size
            width_textviewbox = entry.contentRect.width
            height_textviewbox = entry.contentRect.height
            svgwidth = width_treeviewbox - borderweight_viewbox * 2;
            svgheight = height_treeviewbox - borderweight_viewbox * 2;

            //update the size of the svg
            svg.attrs({
                'width': entry.contentRect.width - borderweight_viewbox * 2, // note: it does not word here to use 'svgwidth'. Maybe it is not updated yet
                'height': entry.contentRect.height - borderweight_viewbox * 2
            })
            thetreerect.attrs({
                'width': entry.contentRect.width - borderweight_viewbox * 2,
                'height': entry.contentRect.height - borderweight_viewbox * 2
            })

        });
    });
    const elmsToObserve = document.querySelector('.treeviewbox');
    myObserver.observe(elmsToObserve);
}
// the following is not used as it is not necessary
function observetextvewboxsize() {
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



/**the following is related to adding substeps according to sas program from an egp file */
// add substeps of the current node
function addSubSteps(d) {

    // get the NodeDescription
    var theNodeText = d.NodeDescription;
    // console.log('the node text')
    // console.log(theNodeText)

    //get the SAS code contents
    var theRegEx = /(\/\/\/s)([\s\S])*?(s\/\/\/)/i;

    if (theNodeText !== null && theNodeText !== undefined && theNodeText.match(theRegEx) !== null) {
        // get text of the first matched item
        var theSASCodeContents = theNodeText.match(theRegEx)[0]
        // strip off the ///s and s///
        theSASCodeContents = theSASCodeContents.replace(/\/\/\/s/i, '')
        theSASCodeContents = theSASCodeContents.replace(/s\/\/\//i, '')

        //replace the html symbols (e.g., <br/>, #nbsp, &#59 )
        theSASCodeContents = theSASCodeContents
            .replace(/<br\/>/gi, '\n')
            .replace(/<br \/>/gi, '\n')
            .replace(/<br>/gi, '\n')
            .replace(/<div>/gi, '')
            .replace(/<\/div>/gi, '\n')
            .replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, '\t') // the error is seen in the original Node
            .replace(/&nbsp&nbsp&nbsp&nbsp/g, '\t')
            .replace(/&nbsp/g, ' ')
            .replace(/&#59/g, ';')

        // console.log(theSASCodeContents)

        // now input the SAS code contents and make an obj from it
        var theSubSteps = makeSubSteps(theSASCodeContents)
        // console.log('substeps in addsubsteps ====')
        // console.log(theSubSteps)

        // push the substeps into d.children
        if (theSubSteps !== null) {
            if (d.children === undefined || d.children === null) {
                d.children = []
            }
            d.children.push(theSubSteps)
        }

    } // end if   (theNodeText.match(theRegEx)...

    //recursive for d.children. No, the system may blow up!
    function notrun() {
        if (d.children) {
            d.children.forEach(c => {
                addSubSteps(c)
            })
        }
    }

} //addSubSteps



function notrun_testing() {
    addSubSteps(aNode)
    // console.log(aNode)
    var thehtml = '';
    function getit(aNode) {
        console.log(aNode.children)
        if (aNode.children.length > 0) {
            aNode.children.forEach(d => {
                thehtml = thehtml + d.NodeDescription + '&#59<br/>======================================<br/>'
                if (d.children) {
                    getit(d)
                }
            })
        }

    }
    getit(aNode)

    d3.select('body').append('div').html(thehtml).styles({ 'font-size': '30px', 'font-family': "Consolas" })
    // console.log(targetobj)
}






// use this function as I want to store the replaced strings (each of different contents) in order and in an array so that they can be restored
function PickupMatched(srcobj, theRegEx, replacedkeyTemplate) {
    // console.log(theRegEx.source.includes('proc&nbsp') )
    // console.log(/proc&nbsp([\s\S])*?quit&#59/i = /proc&nbsp([\s\S])*?quit&#59/i)
    // the srcobj must have .origin, .replaced, and .replacements
    // check for the special condition of proc quit/ proc run
    if (theRegEx.source.includes('proc&nbsp')) { // .source is to turn theRegEx into a string. The condition is whether the regex contains 'proc ', the regex could be for proc run, or proc quit

        // console.log('getting content within a proc')
        /**If the regex is about match contents in a PROC, the following scenarios need to be considered
         * 1) PROC .... RUN;
         * 2) PROC .... QUIT;
         * It can run into error if the code is like the following, while matching contents between PROC and Quit.
         *  PROC ....;
         *      RUN;
         *  PROC ....
         *      Quit;
         * In the above case, two procedures will be taken as one. Conversely it could happen when matching contents
         *  between PROC and RUN.
         * 
         * So for the following, the idea is to get quit; or run; whichever comes first
         */
        var matchProcQuit = srcobj.replaced.match(/proc&nbsp([\s\S])*?quit&#59/i);
        var matchProcRun = srcobj.replaced.match(/proc&nbsp([\s\S])*?run&#59/i);

        // if one of the regex (proc...quit) (proc...run) is not null while the other is, use the non-null regex 
        if (matchProcQuit !== null && matchProcRun === null) {
            theRegEx = /proc&nbsp([\s\S])*?quit&#59/;
        } else if (matchProcQuit === null && matchProcRun !== null) {
            theRegEx = /proc&nbsp([\s\S])*?run&#59/;
        } else if (matchProcQuit !== null && matchProcRun !== null) {
            // if none of the two are null, check and take the regex of which the matched str is shorter
            if (matchProcQuit[0] < matchProcRun[0]) {
                theRegEx = /proc&nbsp([\s\S])*?quit&#59/i
                // console.log('getting content between proc and quit')
            } else {
                theRegEx = /proc&nbsp([\s\S])*?run&#59/i
                // console.log('getting content between proc and run')
            }
        } // else ? what if both are null? In that case it'll be skipped by the following program
    }


    if (srcobj.replaced.match(theRegEx) !== null) {

        // get the matched string
        var theMatched = srcobj.replaced.match(theRegEx)[0];

        // determine the length of the current .replacements (to be used as the index number)
        var replacedIndex = srcobj.replacements.length;
        // have an empty obj as the replacement piece
        var replacement = {}
        // .key of the replacement piece, which followings the specified template
        replacement.key = '___' + replacedIndex + '_' + replacedkeyTemplate + '___';
        // .value is the matched string
        replacement.value = theMatched;
        // console.log(replacement)

        //push the replacement piece (the key, and the matched string) into .replacements
        srcobj.replacements.push(replacement)
        // console.log('the replacements ===============')
        // console.log(srcobj.replacements)

        //in the text, replace the matched string (the first instance) with the match key
        var resultText = srcobj.replaced.replace(theRegEx, replacement.key)
        srcobj.replaced = resultText

        //now the recursive part
        if (srcobj.replaced.match(theRegEx) !== null) {
            // console.log('recursively run PickupMatched')
            srcobj = PickupMatched(srcobj, theRegEx, replacedkeyTemplate)
        }
    }
    return srcobj
} // end PickupMatched


// given a text, turn it into an object
// make text segments it into blocks and save in .block
// replacing text such as comments, datasteps, etc by a key, and save the replaced text into .replacements 
function codeToObj(theCodeText) {

    // the src string is put into an obj, from this point, the rest are worked in that obj
    var initobj = {}
    initobj.origin = theCodeText;
    initobj.replaced = initobj.origin;
    initobj.replacements = [];

    // Note: must strictly follow the steps in order!!!

    //1. use the PickupMatched to extract multiple line comments an array
    //Note!!! do not use /gm, otherwise all of the matched strings will be replaced at the same time
    // Which is not what we want here. We want each mached string to be saved as different elements in .replacements
    var betweenmultilinecomments = /\/\*[\s\S]*?\*\//; //i.e., start with '/*', both escaped by \, and end with (?) '*/', also both escaped. in between, ([]), any length (*),not escaped, of white space chars (\s) and non-white space chars (\S)
    initobj = PickupMatched(initobj, betweenmultilinecomments, 'multilinecomments0824')

    //2. use the PickupMatched to extract single line comments start with %*
    var betweensinglelinecomments1 = /%\*[^(\r|\n|\r\n)]*?;/; // start with %*, end with ;, no line breakers in between (must be in a single line)
    initobj = PickupMatched(initobj, betweensinglelinecomments1, 'singlelinecomments10824')

    //3. use the PickupMatched to extract single line comments start with *
    /**Note!!! must use ?= instead of ?  
     * ? alone matches content between * and ;, even if they are in multiple lines. This is not correct
     * ?= instead matches content between * and ;, only for those IN the SAME LINE! 
    */
    var betweensinglelinecomments2 = /\*[^(\r|\n|\r\n)]*?;/;
    initobj = PickupMatched(initobj, betweensinglelinecomments2, 'singlelinecomments210824')

    //contents in quotes and apostrophes must be extacted first. The rules to identify comments does not apply to these contents
    //4. use the PickupMatched to extract contents between double quotes into an array
    var regex_betweenQuotes = /"([^"]*)"/
    initobj = PickupMatched(initobj, regex_betweenQuotes, 'quotes0824')


    //5. use the PickupMatched to extract contents between apostrophes into an array
    var regex_betweenApostrophes = /'([^']*)'/
    initobj = PickupMatched(initobj, regex_betweenApostrophes, 'apostrophes0824')


    //6. clean up whitespaces and line breakers between run and ; 
    //Note !!! Must be before step 8-11
    // console.log(console.log(text9.match(/run[ \t(\n|\r|\r\n)]*;/gmi)) // between run and ; (case insensitive), only contains white space or line breakers
    initobj.replaced = initobj.replaced.replace(/run[ \t(\n|\r|\r\n)]*;/gmi, 'run;') // for directly replacing all matched strings, it is ok to use the opiton /g

    //7. clean up whitespaces and line breakers between quit and ;
    //Note !!! Must be before step 8-11
    initobj.replaced = initobj.replaced.replace(/quit[ \t(\n|\r|\r\n)]*;/gmi, 'quit;')

    //8 clean up whitespaces between ; and link break 
    var re = /;[ \t]*\n/gmi
    initobj.replaced = initobj.replaced.replace(re, ';\n')

    //8. replace line breakers with br
    // rtext1 = initobj.replaced.replace(/\n/gm, '<br/>')
    initobj.replaced = initobj.replaced.replace(/\n/gm, '<br/>')


    //9. replace tab with nbsp
    // rtext2 = rtext1.replace(/\t/gm,'&nbsp&nbsp&nbsp&nbsp')
    initobj.replaced = initobj.replaced.replace(/\t/gm, '&nbsp&nbsp&nbsp&nbsp')

    //Note: !!! semicolons must be replaced after extracting single line comments. Otherwise the single line comments cannot be identified
    //10. replace semicolons with &#59 // Must having!!! otherwise for lines starting with whitespaces followed by a ';' (like '    ;' ), the ';' will be erased by this step!
    initobj.replaced = initobj.replaced.replace(/;/g, '&#59')

    //11. replace white space with nbsp. It has to be after step8. Otherwise some semicolons will be erased
    var wtsp = /( )/g
    initobj.replaced = initobj.replaced.replace(wtsp, '&nbsp');

    //12 replace the datasteps
    regex_datasteps = /data&nbsp([\s\S])*?run&#59/i;
    initobj = PickupMatched(initobj, regex_datasteps, 'datasteps0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_datasteps0824___/gmi, '_datasteps0824___&#59')


    //13 things between proc and quit are a block
    regex_procs = /proc&nbsp([\s\S])*?quit&#59/i;
    initobj = PickupMatched(initobj, regex_procs, 'procs0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_procs0824___/gmi, '_procs0824___&#59')

    //finally replace content between ; and  <br/> as blocks
    initobj.blocks = initobj.replaced.split(/&#59<br\/><br\/>/m)

    return initobj;

} // end codeToObj()


function makeSubSteps(text) {

    // turn the text into an obj with .blocks, and .replacements
    var targetobj = codeToObj(text)

    var j = 0;
    var subnodes = []
    //for each block, make it a piece of subnodedata, and push it into an array of subnodes
    targetobj.blocks.forEach((d, i) => {
        // get the contents of current block
        d_nowhitespaces = d.replace('<br/>', '').replace('&nbsp', '').replace('&#59', '').replace(/s/g, '')
        // console.log(d_nowhitespaces)
        if (d_nowhitespaces.length) {// if the block has non-whitespace content
            var thesubnodedata = {}
            thesubnodedata.idx = generateUUID();
            thesubnodedata.name = j++;
            var restoredtext = restoreReplaced(d, targetobj.replacements);
            /**the following is to replace semicolon, whitespace, tab, line breakers into html recognizable chars*/
            restoredtext = restoredtext.replace(/;/g, '&#59')
            restoredtext = restoredtext.replace(/(\r|\n|\r\n)/g, '<br/>')
            restoredtext = restoredtext.replace(/\t/g, '&nbsp&nbsp&nbsp&nbsp')
            restoredtext = restoredtext.replace(/( )/g, '&nbsp')
            // console.log(restoredtext)

            thesubnodedata.NodeDescription = '///t<br/>///s<br/>' + restoredtext + '<br/>s///<br/>t///'// restore the replaced text
            subnodes.push(thesubnodedata)

        }
    })

    // for each subnodes, get its following subnode as its child
    subnodes.forEach((d, i) => {
        if (i < subnodes.length - 1) { // if the current node is not the last 
            d.children = [];
            d.children.push(subnodes[i + 1])
        }
    })

    // attache subnodes[0] to a node named substeps
    if (subnodes.length > 0) {
        var substeps = {}
        substeps.idx = generateUUID();
        substeps.name = 'substeps';
        substeps.children = [];
        substeps.children.push(subnodes[0])
    }

    // push substeps as the last child of the program node
    return substeps
}



//restore the text by replacings the keys with original text
function restoreReplaced(t, r) {
    //in t (the block text), find contents between ___ and ___
    var regex_key = /___[\s\S]*?___/;
    var restoredt = t;
    if (t.match(regex_key) !== null) {
        var thekey = t.match(regex_key)[0]
        valueToRestore = r[r.map(obj => obj.key).indexOf(thekey)].value
        restoredt = t.replace(thekey, valueToRestore)
        // recursively, find the the again...
        if (restoredt.match(regex_key) !== null) {
            restoredt = restoreReplaced(restoredt, r)
        }
    }
    return restoredt
}

/**the above is related to adding substeps according to sas program from an egp file */



// The following is to export textbox contents to a word document
//https://phppot.com/javascript/how-to-export-html-to-word-document-with-javascript/
function exportHTML(srcHtml) {
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
        "xmlns:w='urn:schemas-microsoft-com:office:word' " +
        "xmlns='https://www.w3.org/TR/REC-html40'>" +
        "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    var footer = "</body></html>";
    // var srcHtml = header+document.getElementById("source-html").innerHTML+footer;

    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(srcHtml);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'document.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}

function exportTextBox2WordDoc() {
    //check if the textbox is open
    var width_textviewbox = textviewbox.style('width')
    // console.log('width_textviewbox: ' +  width_textviewbox)
    if (width_textviewbox !== '0px') { // if the textview box is visible:
        //get the contains in the text box
        theText = '<html><body>' + thetextbox.node().innerHTML + '</body></html>'
        //strip t and s tags
        theText = theText.replace(/\/\/\/t/gi, '')
        theText = theText.replace(/t\/\/\//gi, '')
        theText = theText.replace(/s\/\/\//gi, '')
        theText = theText.replace(/\/\/\/s/gi, '')
        console.log(theText)
        exportHTML(theText)
    }
}

// The above is to export textbox contents to a word document


/**
 * The following is for making quill app for formating text
 * 
 * 
 */

// make a selector (e.g., a font size dropdown selector, a font color selector, etc.)
// An static example can be found in learning.js (CreateASelector_ItWorks)
function makeqlSelector(theqltoolbox, selectorClassname, selectiondata) {

    //1.a add ql selector
    var theqlselector = theqltoolbox.append('span').attr('class', 'ql-formats')
        .append('select').attr('class', selectorClassname)

    // for font family settings, let the font selector auto fit the width 
    if (selectorClassname === 'ql-font') {
        theqlselector.styles({ 'display': 'inline-block', 'width': '120%' })
    }

    //1.b add options into the selector in a batch, link options to the data elements in the selectiondata obj 
    var theoptions = theqlselector.selectAll('option')
        .data(selectiondata) // data must be specified before enter()
        .enter()
        .append('option')
        ;
    //1.c set attr for each option
    theoptions
        .text(function (d) { return d.text })
        .attrs(function (d) {
            var result = {}
            var key = d.attr // this is the way to set parameter as key of an obj
            result[key] = d.value
            return result
        });
    //following is an alternative way to make attr like .attrs({value:'10px'}), or .attrs({selected:''})
    // .attrs({function(d){
    //   return d.attr + ':' + d.value
    // }})

} //end of makeqlSelector


// make a makeqlelms (e.g., for buttons like bold, italic, etc; for select tags like ql-color, ql-background)
function makeqlelms(theqltoolbox, selectiondata, tagname) {

    //1.a add ql selector
    var theqlelmholder = theqltoolbox.append('span').attr('class', 'ql-formats')

    //1.b add options into the selector in a batch, link options to the data elements in the selectiondata obj 
    var theElms = theqlelmholder.selectAll(tagname)
        .data(selectiondata) // data must be specified before enter()
        .enter()
        .append(tagname)
        ;
    //1.c set attr for each option
    theElms
        .attrs(function (d) {
            /**
             * d is like:
             * {attrs:[
             *          {attr:'class', value:'ql-list'},
                        {attr:'value', value:'ordered'}
                        ],
                text:'text'
                },
             * */
            var result = {}
            /**the result should be like
             * {
             *  'class': 'ql-list',
             *  'value': 'ordered'
             * }
             **/
            d.attrs.forEach(e => {
                /**e is like {attr:'class', value:'ql-list'} */
                var key = e.attr
                result[key] = e.value
                // this will make result.class = 'ql-list', and result.value = 'ordered'
                // i.e., it'll be equivalent to {'class': 'ql-list', 'value': 'ordered'} 
            })
            return result
        });

    //1.d set text for each option
    theElms
        .text(function (d) {
            if (d.text !== null && d.text !== undefined) {
                return d.text
            }
        })

} //end of makeqlelms


/**Create a more complete customized quill rich text format 
 * a complete list of format tools can be found at:
 * https://quilljs.com/docs/formats/ 
*/
//an example is given at : 
//https://stackoverflow.com/questions/43728080/how-to-add-font-types-on-quill-js-with-toolbar-options

function makeQuill(parentBodyDom, id_toolbarbox, id_editorbox) {

    /**the following part is for adding buttons for table editing. 
     * It is enabled by Quill 2.0.0.dev.3. Right now, these functions are not built into the toolbox...
    */
    var thetabletoolbox = d3.select(parentBodyDom).append('div').attr('id', 'thetabletoolbox')
    var tagname = 'button'
    var tableoptionlist = [
        {
            attrs: [
                { attr: 'id', value: 'insert-table' },
            ], text: 'Insert Table'
        },
        {
            attrs: [
                { attr: 'id', value: 'insert-row-above' },
            ], text: 'Insert Row Above'
        },
        {
            attrs: [
                { attr: 'id', value: 'insert-row-below' },
            ], text: 'Insert Row Below'
        },
        {
            attrs: [
                { attr: 'id', value: 'insert-column-left' },
            ], text: 'Insert Column Left'
        },
        {
            attrs: [
                { attr: 'id', value: 'insert-column-right' },
            ], text: 'Insert Column Right'
        },
        {
            attrs: [
                { attr: 'id', value: 'delete-row' },
            ], text: 'Delete Row'
        },
        {
            attrs: [
                { attr: 'id', value: 'delete-column' },
            ], text: 'Delete Column'
        },
        {
            attrs: [
                { attr: 'id', value: 'delete-table' }
            ], text: 'Delete Table'
        }
    ]
    makeqlelms(thetabletoolbox, tableoptionlist, tagname)

    /**End of table edition box */

    //0.1 dynamiclly write css style lines for font setting
    // more fonts can be found at https://fonts.google.com/ just cite the font in html!
    var fontlist = [
        { attr: 'selected', value: '', text: 'Roboto' },
        { attr: 'value', value: 'timesnewroman', text: 'Times New Roman' }, // I made it up. When the fontname is not knonw by js or quill app, it'll be displayed as times new roman!
        // {attr:'value', value:'helvetica', text:'Helvetica'},// this is very close to Roboto
        { attr: 'value', value: 'inconsolata', text: 'Inconsolata' },
        { attr: 'value', value: 'indieflower', text: 'Indie Flower' },
        { attr: 'value', value: 'appleultralight', text: 'Source Sans Pro' },
        // {attr:'value',value:'tinos', text:'Tinos'} // this is also close to Roboto
    ]
    //0.2 prepare a list of font values for Font.whitelist setting in quill app
    var fontsforwhitelist = []
    fontlist.forEach(d => {
        fontsforwhitelist.push(d.value)
    })

    //the following is to set css style in the head part of the index html.
    //however, check the global variable quillcssloaded first (which is init in init.js)
    //If quillcssloaded !==0, skip the following css style strip creating 
    if (quillcssloaded === 0) {
        //0.3 set css style for labels in font selector options
        d3.select('head').append('style').text(
            function () {
                var cssStr = '';
                fontlist.forEach(d => {
                    var theStr = '#toolbar-container .ql-font span[data-label="' + d.text
                        + '"]::before { font-family: "' + d.text + '";}'
                    if (d.value === 'appleultralight') {
                        theStr = '#toolbar-container .ql-font span[data-label="' + d.text
                            + '"]::before { font-family: "' + d.text + '"; font-weight: 200;}'
                    }
                    cssStr = cssStr + theStr
                })
                return cssStr
            }
        )
        //0.4 set css style for text contents (it can be combined with the css setting above, but i'd rather separate them)
        d3.select('head').append('style').text(
            () => { // this is the same as function(){}
                var cssStr = '';
                fontlist.forEach(d => {
                    var theStr = '.ql-font-' + d.value + '{font-family: "' + d.text + '";}'
                    if (d.value === 'appleultralight') {
                        theStr = '.ql-font-' + d.value + '{font-family: "' + d.text + '"; font-weight: 200;}'
                    }
                    cssStr = cssStr + theStr
                })
                return cssStr
            }
        )
        quillcssloaded = 1;
    } // end if
    //the above is to set css style in the head part of the index html.

    //1. create a toolbar container
    var qltoolbarbox = d3.select(parentBodyDom).append('div').attr('id', id_toolbarbox)

    //1.a make ql-fontfamily selector
    /**  how to use apple san francisco fonts?
     * https://stackoverflow.com/questions/32660748/how-to-use-apples-new-san-francisco-font-on-a-webpage
     */
    var selectorClassname = 'ql-font'
    // prepare a list of options (note: one of which is for default value 'selected', 'Default')
    var selectiondata = fontlist
    makeqlSelector(qltoolbarbox, selectorClassname, selectiondata)


    //1.b make ql-fontsize selector, an static example can be found in learning.js
    var selectorClassname = 'ql-size'
    // Need to prepare a whitelist for Size.whitelist for customized sizes
    var selectiondata = [
        { attr: 'value', value: '10px', text: '10px' },
        { attr: 'selected', value: '', text: 'Normal' }, // it'll be 13px! strange
        { attr: 'value', value: '16px', text: '16' },
        { attr: 'value', value: '20px', text: '20' },
        { attr: 'value', value: '36px', text: '36' },
        { attr: 'value', value: '48px', text: '48' },
        { attr: 'value', value: '72px', text: '72' }
    ]
    makeqlSelector(qltoolbarbox, selectorClassname, selectiondata)

    var sizeforwhitelist = []
    selectiondata.forEach(d => {
        sizeforwhitelist.push(d.value)
    })

    //1.c make bold/italic/underline/strike buttons
    // prepare a list of elements (<button>)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-bold' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-italic' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-underline' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-strike' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    /** 1.d make default selectors (for font color, and for highlight background color)
     * Note: unlike in example 2 (see anInteractiveQuillApp() in learning.js), here we'll use
     *  default options for font / highlight background color setting. i.e., there is no need to 
     *  set the selectiondata for each color option. 
     * Also, to use the default selector, do not specify the vars for like:
     *  var BackgroundClass = Quill.import('attributors/class/background');
     * Neither to register the BackgroundClass like:
     *  Quill.register(BackgroundClass, true); 
     * 
     * */

    // prepare a list of elements (<select>) 
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-color' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-background' }
            ]
        }
    ]
    var tagname = 'select'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.e make blockquote/codeblock/hyperlink buttons
    // prepare a list of elements (<button>)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-blockquote' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-code-block' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-link' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-image' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-video' }
            ]
        },
        /** 
         * The following is a cool tool for formulas
         * To enable it, add lines in the html to specify style and js links to Katex
         * https://katex.org/docs/browser.html
         * 
         * Katex uses TeX/LaTeX expressions, which can be found at:
         * https://en.wikibooks.org/wiki/LaTeX/Mathematics
         * Example of logistic regression:
         * outcome = \beta_{0} + \beta_{1} \text{Gender} + \epsilon
         * 
         * \frac{\exp(\beta_{0} + \beta_{1} \text{Gender} + \beta_{2} \text{Age} + \dots +     
         * \beta_{12} \text{immigration)} }{1 + \exp(\beta_{0} + \beta_{1} \text{Gender} + 
         * \beta_{2} \text{Age} + \dots + \beta_{12 }\text{immigration})}
        */
        {
            attrs: [
                { attr: 'class', value: 'ql-formula' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.f make buttons for bullets and indentation
    // prepare a list of elements (<button>)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-list' },
                { attr: 'value', value: 'ordered' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-list' },
                { attr: 'value', value: 'bullet' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-indent' },
                { attr: 'value', value: '-1' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-indent' },
                { attr: 'value', value: '+1' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.g text direction (from left, from right)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-direction' },
                { attr: 'value', value: 'rtl' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.h text alignment (left, right, center, justify)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-align' }
            ]
        }
    ]
    var tagname = 'select'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.i superscript/subscript (Note!!! do not change the order of sub/super. The order is fixed)
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-script' },
                { attr: 'value', value: 'sub' }
            ]
        },
        {
            attrs: [
                { attr: 'class', value: 'ql-script' },
                { attr: 'value', value: 'super' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)

    //1.j clean text formating
    var selectiondata = [
        {
            attrs: [
                { attr: 'class', value: 'ql-clean' }
            ]
        }
    ]
    var tagname = 'button'
    makeqlelms(qltoolbarbox, selectiondata, tagname)


    //2. create an editor container
    var qledictorbox = d3.select(parentBodyDom).append('div').attr('id', id_editorbox)

    // //3. registor and make the quill app

    // // Add fonts to whitelist
    // We do not add Roboto since it is the default (the order of fonts in the white list does not matter)
    // Font.whitelist = ['appleultralight','helvetica', 'inconsolata', 'roboto', 'mirza', 'arial']; // must have!!! otherwise the dropdown list of fonts is displayed, but won't work.
    var Font = Quill.import('formats/font');
    Font.whitelist = fontsforwhitelist;
    Quill.register(Font, true);

    // var BackgroundClass = Quill.import('attributors/class/background'); // no need to set bkgroundclass if to use default backgound color options
    // var ColorClass = Quill.import('attributors/class/color'); // same as above

    var SizeStyle = Quill.import('attributors/style/size');
    SizeStyle.whitelist = sizeforwhitelist;
    Quill.register(SizeStyle, true);

    // Quill.register(BackgroundClass, true); // when using default setting of background classes, do not register it
    // Quill.register(ColorClass, true); // when using default setting for font color, do not register it
    // var options={
    //   modules: {
    //     toolbar: '#toolbar-container'
    //   },
    //   placeholder: 'The is the default text...',
    //   theme: 'snow'
    // } 

    // var quill = new Quill('#editor-container', options);

    // new since commit 147a for blot formatter
    // see example setting (As Module) at https://github.com/Fandom-OSS/quill-blot-formatter
    Quill.register('modules/blotFormatter', QuillBlotFormatter.default);


} // End makequill()


/**The following is for exchanging data between js php and mysql */

// to check tree json data change periodically
function checkJSONPeriodically(interval_sec) {
    let interval_ms = interval_sec * 1000;
    let timerId = setTimeout(function tick() {
        //must convert to text string, as the items stored in sessionStorage has to be strings.
        var theCurrentTreeData = JSON.stringify(rootdatapoint_sortedrowscols.data)

        // need to deal with the max quota of 2MB for session/local storage issue
        var quota = 2000000
        if (theCurrentTreeData.length > quota) {
            console.log('the json file is too large (> 2MB), cannot be saved in sessionStorage. Save it to local disk directly in every five minutes. The file is not sent to mysql.')
            jsonstr_js2php2mysql_nosessionStorage()
            // make the checking interval longer
            interval_ms = 60 * 5000; // make it every 5 minutes
        } else {
            var theLastTreeData = sessionStorage.getItem("thejsonstr")
            // console.log(theLastTreeData)
            if (theLastTreeData === theCurrentTreeData) {
                console.log("tree unchanged")
            } else {
                console.log("tree changed");
                console.log('length of the current tree', theCurrentTreeData.length)

                //save the current grandroot into sessionStorage				
                sessionStorage.setItem("thejsonstr", theCurrentTreeData);
                // save the json to MySQL
                jsonstr_js2php2mysql();
            } // if changed
        } // if exceed quota


        //repeat 
        timerId = setTimeout(tick, interval_ms);
    }, interval_ms
    );
}

// The same function as jsonstr_js2php2mysql, just do not use the sessionstorage
function jsonstr_js2php2mysql_nosessionStorage() {
    //get the most recent json data
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);
    //prepare a json obj with keys including slqtable, josnstr, userid, and jsonstrname
    //note: the stringified jsonstr is only 1 element of the json obj
    var
        v0 = 'd3treejson',
        v1 = jsonstr,
        v2 = sessionStorage.getItem('theuserid'),
        v3 = sessionStorage.getItem('thejsonstrname');
    jsontosend = {
        sqltable: v0,
        jsonstr: v1,
        userid: v2,
        jsonstrname: v3,
        sendtomysql: 'n' // not to send the data to mysql (too large) 
    }

    // Post the json data to a php file, and receive response text echoed on that php file
    //https://api.jquery.com/jQuery.post/
    // The jquery way is simply to specify: 1) the target php, 2) the name of the json data 3) the data type.

    var jqxhr = $.post(
        "php/js2php2mysql.php",
        jsontosend,
        'json'
    )
        // the following is to return the contents printed on the target php, so that user can 
        // moniter whether the target php runs normally or having errors.
        .done(function (d) {
            console.log('On php/js2php2mysql.php:\n' + d);
        }) // end post
} // end jsonstr_js2php2mysql()




// send jsonstr from js to php then to mysql, note, it is the same method to save the json as a local file
// saving a local file is done by php/js2php2mysql.php
function jsonstr_js2php2mysql() {
    //get the most recent json data
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);
    //prepare a json obj with keys including slqtable, josnstr, userid, and jsonstrname
    //note: the stringified jsonstr is only 1 element of the json obj
    var
        v0 = 'd3treejson',
        v1 = sessionStorage.getItem('thejsonstr', jsonstr),
        v2 = sessionStorage.getItem('theuserid'),
        v3 = sessionStorage.getItem('thejsonstrname');
    jsontosend = {
        sqltable: v0,
        jsonstr: v1,
        userid: v2,
        jsonstrname: v3,
        sendtomysql: 'y whatever'
    }

    // Post the json data to a php file, and receive response text echoed on that php file
    //https://api.jquery.com/jQuery.post/
    // The jquery way is simply to specify: 1) the target php, 2) the name of the json data 3) the data type.

    var jqxhr = $.post(
        "php/js2php2mysql.php",
        jsontosend,
        'json'
    )
        // the following is to return the contents printed on the target php, so that user can 
        // moniter whether the target php runs normally or having errors.
        .done(function (d) {
            console.log('On php/js2php2mysql.php:\n' + d);
        }) // end post
} // end jsonstr_js2php2mysql()


// get jsonstr from mysql to php then to js
function jsonstr_mysql2php2js() {
    //Note:!!!
    //Need to create an upfront step to select a JSON name from the names stored in MySQL database...


    //prepare a json obj with keys including slqtable, josnstr, userid, and jsonstrname
    //note: the stringified jsonstr is only 1 element of the json obj
    var
        v0 = 'd3treejson',
        v1 = sessionStorage.getItem('theuserid'),
        v2 = sessionStorage.getItem('thejsonstrname');
    jsontosend = {
        sqltable: v0,
        userid: v1,
        jsonstrname: v2
    }

    // Post the json data to a php file, and receive response text echoed on that php file
    //https://api.jquery.com/jQuery.post/
    // The jquery way is simply to specify: 1) the target php, 2) the name of the json data 3) the data type.

    var jqxhr = $.post(
        "php/mysql2php2js.php",
        jsontosend,
        'json'
    )
        // the following is to return the contents printed on the target php, so that user can 
        // moniter whether the target php runs normally or having errors.
        .done(function (d) {
            // console.log( 'On php/mysql2php2js.php:\n' + d );
            //get it back to json obj
            treeData = JSON.parse(d)
            // console.log(receivedJSON)
            NewTree(treeData)
        }) // end post
} // end jsonstr_js2php2mysql()
/**The above is for exchanging data between js php and mysql */


/**the following is for copy paste a tree node and its descendants */
// To paste or attache the tree data that has been saved by copy action
function PasteTreeData(theParentTreeData, theTreeDataToPaste) {

    //hide the tree box
    hideSentences()

    // these adding stuff is too complicated and prone to miss a thing or two
    //simply update the treedata, and remake the whole tree!

    //1. create a thenewSubTreeJSON with the theTreeDataToPaste.data    
    // console.log(theTreeDataToPaste)
    // console.log(theParentTreeData.data.children)

    //must have!!! the theTreeDataToPaste should be a new data json, not the nickname of the existing data json!
    var thenewSubTreeJSON = selectCopy([theTreeDataToPaste])[0]
    // console.log(thenewSubTreeJSON)

    //must have!!! make new idx for the replicants
    var oldidxarray = [], newidxarray = []
    function addnewidx(thetreeDataNode) {
        //create two arrays to hold old and new idx
        var oldidx, newidx;
        //remember the old idx, push it into an array of old idx
        oldidx = thetreeDataNode.idx;
        // push the old idx into the oldidxarray if it is not in oldidxarray
        if (!oldidxarray.includes(oldidx)) {
            oldidxarray.push(oldidx)
            //create a new idx, and push it to the array of new idx
            newidx = generateUUID()
            newidxarray.push(newidx)
        }
        //recursively run for children nodes
        if (thetreeDataNode.children) {
            if (thetreeDataNode.children.length > 0) {
                thetreeDataNode.children.forEach(h => {
                    addnewidx(h)
                })
            }
        }
    }
    addnewidx(thenewSubTreeJSON)
    // console.log(oldidxarray)
    // console.log(newidxarray)

    //for the copied node and its descendants, replace the old idx with new ones, also replace the idx in the
    // custpartents field
    function updateidx(thetreeDataNode) {
        thetreeDataNode.idx = newidxarray[oldidxarray.indexOf(thetreeDataNode.idx)]
        //rename the name of the pasted nodes by adding '_copy'
        thetreeDataNode.name = thetreeDataNode.name + "_copy"
        //update the idx of the custparents
        if (thetreeDataNode.custparents !== null && thetreeDataNode.custparents !== undefined
            && thetreeDataNode.custparents.length > 0) {
            thetreeDataNode.custparents.forEach(d => {
                // Only update the idx if it appears in the oldidxarray
                // if the custparent is not within the copied node and its descendants, there is no need to update it
                if (oldidxarray.includes(d.idx)) {
                    d.idx = newidxarray[oldidxarray.indexOf(d.idx)]
                }
            })
        }
        // recursive for descendants
        if (thetreeDataNode.children) {
            if (thetreeDataNode.children.length > 0) {
                thetreeDataNode.children.forEach(h => {
                    updateidx(h)
                })
            }
        }
    }
    updateidx(thenewSubTreeJSON)
    // console.log(thenewSubTreeJSON)

    // add the theParentTreeData.data.idx (the new parent's idx) to thenewSubTreeJSON.custparents
    if (thenewSubTreeJSON.custparents === undefined || thenewSubTreeJSON.custparents === null) {
        thenewSubTreeJSON.custparents = [];
    }
    thenewSubTreeJSON.custparents.push({ idx: theParentTreeData.data.idx })

    /** attach the newsubtreeJson to theParentTreeData.data.children */
    if (theParentTreeData.data.children === undefined || theParentTreeData.data.children === null
        || theParentTreeData.data.children === false) {
        theParentTreeData.data.children = [];
    }
    theParentTreeData.data.children.push(thenewSubTreeJSON)

    // new tree!
    NewTree(rootdatapoint_sortedrowscols.data)

} //end PasteTreeData
/**the above is for copy paste a tree node and its descendants */


/**the following is for adding nodes from another json file */
// add tree nodes from an external file
function addnodesfromfile(theParentTreeData) {
    //delete existing tmpinput with a classname =file_input_appendnodes
    d3.selectAll('input.file_input_appendnodes').remove()
    // create an invisible input button
    var tmpinput = buttonsdiv.append('input')
        .attrs({ 'type': 'file', 'id': 'file_input_appendnodes', 'class': 'file_input_appendnodes' })
        .styles({ 'display': 'none' })
        .node();
    //click it
    tmpinput.click()
    // when a file is loaded
    tmpinput.onchange = e => {

        //hide the textbox
        hideSentences()

        // get the file obj
        var thefirstfileobj = e.target.files[0]; //e.target === this

        //get the extension name
        var ext = thefirstfileobj.name.substring(thefirstfileobj.name.lastIndexOf('.') + 1)

        if (ext.toLowerCase() === 'egp') { // if the extension is egp, run import from egp

            GetRootFromEGPAfterReloading(theParentTreeData, e.target);

        } else { // else run import from json
            // use the function readfile to read the first file, get the treeData, and use the treedata to make a new tree
            readlocalfile(thefirstfileobj, function (f) { // the 'funciton(f){...}' part is the call back function coresponding to the 'callback' in the function readfile()
                // console.log(f.target.result)
                var treenodesdata = JSON.parse(f.target.result)
                // create the tree data
                // console.log('treeData when file_input is ready ======')
                // must have!!! external file without a name as .json will be loaded as an array
                if (Array.isArray(treenodesdata)) {
                    treenodesdata = treenodesdata[0];
                }
                // console.log(treenodesdata) 
                PasteTreeData(theParentTreeData, treenodesdata)
                // treeData = null;
                // collapseAll(rootdatapoint_sortedrowscols)
            });
        } // end if
        //remove the tmpinput
        tmpinput.remove()
    } //end tmpinput.onchange
} // end addnodesfromfile
/**the above is for adding nodes from another json file */

/**the following is for adding nodes from an egp file */
// from a local egp file (or any zip files)
function GetRootFromEGPAfterReloading(theParentTreeData, d) {

    //initialize the root parent
    var therootparent;

    // console.log(d)
    //https://stackoverflow.com/questions/32267930/get-name-of-files-of-zip-file-in-javascript
    var thezipfile = d.files[0];

    // console.log(thezipfile)

    var reader = new FileReader();
    reader.readAsBinaryString(thezipfile);

    reader.onloadend = function (e) {

        var myZip = e.target.result;
        var unzipper = new JSUnzip(myZip);

        unzipper.readEntries();

        //myFiles, or the entries contains a flatterned list of files, in which
        // the .fileName contains filePath and fileName in the
        var myFiles = unzipper.entries;

        for (var i = 0; i < myFiles.length; i++) {

            var name = myFiles[i].fileName; // This is the file name
            // console.log( myFiles[i].fileName)

            //find the file 'project.xml' and extract its content as html DOM
            if (name === 'project.xml') {

                var content = JSInflate.inflate(myFiles[i].data); // this is the content of the files within the zip file.

                //remove the non printable characters (indeed the non ascII chars)
                var rcontent = content.replace(/[^\x20-\x7E]/g, ''); //!!!! must have, as the original content contains non-printable characters which cause error when transferrring to html DOM
                //replace \ with \_. This is to prevent errors caused by backslash
                rcontent = rcontent.replace(/\\/g, '\\_');

                //The xml sucks, instead, import the rcontent str as HTMLDOM
                var htmlDoc = $.parseHTML(rcontent)
                // console.log($(htmlDoc)) // the node 'projectcollection' contains all relavant info

                htmlDoc.forEach(elm => {
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
                        var splitArrays = getDefaultCustLinks(linksarray, tasksarray)
                        var defaultlinksarray = splitArrays.defaultlinks;
                        var custlinksarray = splitArrays.custlinks;
                        // console.log(defaultlinksarray)
                        // console.log(custlinksarray)

                        //3) for each task, determine .children .custparents
                        therootparent = getTaskChildrenCustparents(tasksarray, defaultlinksarray, custlinksarray, therootparent);
                        PasteTreeData(theParentTreeData, therootparent)
                    }
                })
            } // end if (name === ...)
        } // end for myfiles loop

    } // end reader.onload =...
} // End ImportFromEGPAfterReloading
/**the above is for adding nodes from an egp file */


// additional: post json to a php which turns the str to hex and save as tmp/tmphexstr.txt
// send jsonstr from js to a php which converts the jsonstr into hexstr, and save as a text 
function postbinstr2php() {
    //get the most recent json data
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);
    //prepare a json obj with keys including slqtable, josnstr, userid, and jsonstrname
    //note: the stringified jsonstr is only 1 element of the json obj
    var
        v1 = sessionStorage.getItem('thejsonstr', jsonstr),
        jsontosend = {
            binstr: v1
        }

    // Post the json data to a php file, and receive response text echoed on that php file
    //https://api.jquery.com/jQuery.post/
    // The jquery way is simply to specify: 1) the target php, 2) the name of the json data 3) the data type.

    var jqxhr = $.post(
        "php/hexstr2txt.php",
        jsontosend,
        'json'
    )
        // the following is to return the contents printed on the target php, so that user can 
        // moniter whether the target php runs normally or having errors.
        .done(function (d) {
            console.log('On php/hexstr2txt.php:\n' + d);
        }) // end post
} // end postbinstr2php()

//remove all surfix of '_copy' from data node names
function removeit() {
    //recursively change node names, removing the surfix '_copy'
    function removesurfix(startdatapoint, surfixstr) {
        // check if the name of the current datapoint end with the surfixstr
        if (startdatapoint.name.endsWith(surfixstr)) {
            //remove the surfixstr
            // get the last index of the surfix str 
            var n = startdatapoint.name.lastIndexOf(surfixstr);
            startdatapoint.name = startdatapoint.name.substring(0, n)
            console.log(startdatapoint.name)
        }
        // recursively do the same for children nodes of the startdatapoint
        if (startdatapoint.children !== undefined
            &&
            startdatapoint.children !== null
            &&
            startdatapoint.children.length !== 0
        ) {

            startdatapoint.children.forEach(d => {
                removesurfix(d, surfixstr)
            })
        }
    }
    removesurfix(rootdatapoint_sortedrowscols.data, '_copy')
    // new tree!
    NewTree(rootdatapoint_sortedrowscols.data)

} // function removeit()


/*the following part was added since 161a for search contents */

// toggle show/hide the search box
function showSearch() {
    //display the input box
    if ($("#searchBox").css('display') === "none") {
        $("#searchBox").css('width', "300px");
        $("#searchBox").css('display', "block");
        $("#searchBox").css('height', "auto");
        //console.log($("#showSearchBtn").text())
        $("#showSearchBtn").text("hideSearch")//prop("value", "hideSearch");

        // add a listener, when the enter key is pressed and is keyup, click the ok button
        theSearchInputBoxObj.node().addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                searchOKBtnObj.node().click();
            }
        });
    } else {
        $("#searchBox").css('display', "none");
        $("#searchBox").css('height', "0");
        $("#showSearchBtn").text("showSearch");
        $("#searchBox").css("background", "none");
        $("#searchResult").css("background", "none");
        $("#searchResult").text("");
        $("#searchinput").val("");
    }
}

//when key word is input and click the 'OK' button, run and return search results
function searchCluesbyKey() {
    //empty the search result box
    $('#searchResult').empty();
    //get the search keyword
    var theKeyword = $('#searchinput').val();
    //console.log(theKeyword)
    if (theKeyword === "") {
        $("#searchResult").css("background", "none");
        return;
    }
    //get the search results;
    var theSearchResults = searchInClues(theKeyword);
    // //display it in the search box;
    theSearchResults.forEach(function (d) {
        var theSentenceHTML =
            "<span idx='" + d.idx + "' class='showtext'" + "onmouseover='onsentencehover(this)'"
            + "onmouseout='onsentenceout(this)'>"
            + d.sentence + "<br/>" + "<span style='font-size:20px;font-weight:bold;'>[Node: " + d.name + "]" + "</span>"
            + "&nbsp</span></p>";
        $('#searchResult').append(theSentenceHTML)
    })
    if (theSearchResults.length === 0) {
        $('#searchResult').append("Nothing found.");
    } else {
        $("#searchResult").css("background", "lightgrey");
    }

    //ctrl left click to lock
    CtrlClickToLock();

} //searchCluesbyKey

//search for th results on the current page
function searchInClues(thekeyword) {

    // get data points of all g nodes
    var allnodesdata = d3.selectAll('g.nodeGs').data();
    // console.log(allnodesdata)

    //define the regex of key word  (all incidences, ignore case)
    var theRegKeyWord = new RegExp(thekeyword, 'ig');

    var searchResult = [];

    // loop for each data point
    allnodesdata.forEach(d => {
        // get the html in d.data.NodeDescription
        if (d.data.NodeDescription !== undefined) {
            // console.log(d.data.NodeDescription)
            // the NodeDescription is like a string of HTML (<p><image></image></p>)
            // it is really unnecessary to strip the html tags, but the following function does the trick anyway
            var descTxt = extractContent(d.data.NodeDescription, true)
            // console.log(descTxt)
            //split sentences by ".! or ?"
            var theSegments = descTxt.split(/[.!?]+/);
            theSegments.forEach(function (e) {

                if (theRegKeyWord.test(e)) {
                    //replace the searched word with bold html
                    e = e.replace(theRegKeyWord, function (str) {
                        return "<span style='font-weight:bold;font-style:italic;font-size:20px'>" + str + "</span>"
                    })
                    //remove the asterisks (like *************)
                    e = e.replace(/\*/g, "");
                    //console.log(e)
                    //push the matched sentences into the result array
                    searchResult.push({ idx: d.data.idx, name: d.data.name, sentence: e })
                }
            })

        }// end if
    })

    // console.log(searchResult)
    return searchResult;
} // searchInClues


// a function to extract text contents from html strings
// https://stackoverflow.com/questions/28899298/extract-the-text-out-of-html-string-using-javascript/28899585
function extractContent(s, space) {
    var span = document.createElement('span');
    span.innerHTML = s;
    if (space) {
        var children = span.querySelectorAll('*');
        for (var i = 0; i < children.length; i++) {
            if (children[i].textContent)
                children[i].textContent += ' ';
            else
                children[i].innerText += ' ';
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
};


