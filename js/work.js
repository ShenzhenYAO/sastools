
{/* <div id="textBox" contenteditable="true" 
style="width:65%; height:0px; max-height:300px; font-size:25px; float:left; overflow: auto;  
background-color: lightgrey; padding :5px; margin:2px; line-height: 1.6; display:none;" >
</div>	
<div id="hintBox" contenteditable="true"  
style="width:30%; height:0px; max-height:300px; font-size:25px; float:right; overflow:auto;padding :5px; 
margin:2px;display:none;" >
</div> */}

//build a textBox:
thetextbox=textviewbox.append('div')
    .attrs({'id': 'textBox', 'contenteditable': 'true'})
    .styles({
        "width":'65%', 
        'height':'0px', 
        'max-height':height_textviewbox + 'px',
        'font-size':'25px',
        'float':'left',
        'overflow': 'auto',
        'background-color': 'lightgrey',
        'padding' :'5px',
        'margin':'2px',
        'line-height': '1.6',
        'display':'none'
    })
;



//build a text hint box:
thehintbox=textviewbox.append('div')
    .attrs({'id': 'hintBox', 'contenteditable': 'true'})
    .styles({
        "width":'30%', 
        'height':'0px', 
        'max-height':height_textviewbox + 'px',
        'font-size':'25px',
        'float':'left',
        'overflow': 'auto',
        // 'background-color': 'lightgrey',
        'padding' :'5px',
        'margin':'2px',
        'line-height': '1.6',
        'display':'none'
    })
;


//get the text beween tags (///t t///)
function getContentsBetweenTags(d){
                
    // set the default result = ''
    var result='' ;

    //check if the text contains the start delimiter
    if (d.includes('///t') ) {
        // get the text segment after '///t'
        var textseg1=d.split('///t')[1]
        //check if the text contains the end delimiter
        if (d.includes('t///')){
            result = textseg1.split('t///')[0].trim()
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
        var theTmpNodeContents= getContentsBetweenTags(obj.data.NodeDescription) //d3v4
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

    // listen to changes in the text box
    ShowSentenceChangeListener()

}// end showSentences()


// on sentencehover, centerize the node in the tree diagram
function onsentencehover(theEle){

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

}


//on mouse moving out of the sentence, unhighlight the sentence, and returnt the circle to normal
function onsentenceout(theEle){

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
        zoomLevel = 1;// zoomSettings.zoomLevel;

        //5.1.2.a.3 update the centeredNode, i.e., let it be the currentl selected node
        centeredNode = d
    } 

    //5.1.3 determine the string for travel (translate)
    // the syntax is like 'translate (221, 176)'

    //unlike click and zoom in zoom out, this time, put the selected node 60px to the left, not at the horizontal center
    //var translate_mapUpperLeft='translate (' + width_treeviewbox/2 + ',' + height_treeviewbox/2 + ')'
    var translate_mapUpperLeft='translate (' + 100 + ',' + height_treeviewbox/2 + ')'


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
}



//when the text in the textBox changed, make change in the nodedescription
function ShowSentenceChangeListener2(){
	var theSpans=document.getElementsByClassName("sentence");
	//push the sentences into an array to save the current text contents
	var _sentences =[];
	for (i=0;i<theSpans.length;i++){
		_sentences.push(theSpans[i].innerText)		
	}
	var thetexBox=document.getElementById("textBox");
		thetexBox.addEventListener("input", function(d) { 
			//use input instead of keyup, as keyup does not detect font or hyperlink change that are not caued by key pressing
//console.log(d)
			//once the text Box is changed
			//get a collection of ele with class of "span"
			var theNewSpans=$(d.target).find("span")
			for (i=0;i<theNewSpans.length;i++){
				var theOldSpanText=	_sentences[i];
				var theNewSpanText = theNewSpans[i].innerText;
				if (theOldSpanText !==theNewSpanText){
					//console.log("span " + i + "changed")
					//save the changed into _sentences
					_sentences[i]=theNewSpanText;
					//update the nodedescription
						//get the idx
						var theIdx = theNewSpans[i].id
						//find the node(its attr (idx = d.id), this is done by jquery. 
						var theAttr= "[idx=" + theIdx + "]";
						var theNodeG= $(theAttr);
						//get the nodeData
						var theNodeData = theNodeG[0].__data__;
						//get the nodeData.NodeDescription
						var theNodeDesc=theNodeData.NodeDescription;
						//split the nodeDescription into two parts, one for sentence, on for hints
						var theNodeDescSentenceHintHTML = getNodeDescSentenceHintHTML(theNodeDesc);
						//replace the sentence part with theNewSpanText
						var theNewSentenceHTML = "<font size='3'>" + theNewSpanText + "</font>" ;
						var theNewSentenceHintHTML = theNewSentenceHTML + theNodeDescSentenceHintHTML.theHintsHTML;
						//save the updated NodeDescription into nodeData
						theNodeData.NodeDescription = theNewSentenceHintHTML;
						//console.log(theNodeData)
				}
			}
		})
}


       