
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


/**the following is related to adding substeps according to sas program from an egp file */
// add substeps of the current node
function addSubSteps(d){

    // get the NodeDescription
    var theNodeText = d.NodeDescription;
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
        theSASCodeContents=theSASCodeContents
            .replace(/<br\/>/gi, '\n')
            .replace(/<br \/>/gi, '\n')
            .replace(/&nbsp&nbsp&nbsp&nbsp/g, '\t')
            .replace(/&nbsp/g, ' ')
            .replace(/&#59/g, ';')
        
        console.log(theSASCodeContents)

        // now input the SAS code contents and make an obj from it
        var theSubSteps = makeSubSteps(theSASCodeContents)
        // console.log('substeps in addsubsteps ====')
        // console.log(theSubSteps)

        // push the substeps into d.children
        if (theSubSteps !== null){
            if (d.children === undefined || d.children === null){
                d.children=[]
            }
            d.children.push(theSubSteps)
        }

    } // end if   (theNodeText.match(theRegEx)...
    
    //recursive for d.children. No, the system may blow up!
    function notrun() {
        if (d.children) {
            d.children.forEach(c=>{
                addSubSteps(c)
            })
        }
    }

} //addSubSteps



function notrun_testing(){
    addSubSteps(aNode)
    // console.log(aNode)
    var thehtml='';
    function getit(aNode){
        console.log(aNode.children)
        if (aNode.children.length > 0) {
            aNode.children.forEach(d=>{
                thehtml =thehtml + d.NodeDescription + '&#59<br/>======================================<br/>'
                if (d.children){
                    getit(d)
                }
            }) 
        }
    
    }
    getit(aNode)

    d3.select('body').append('div').html(thehtml).styles({'font-size': '30px','font-family': "Consolas" })
    // console.log(targetobj)
}






// use this function as I want to store the replaced strings (each of different contents) in order and in an array so that they can be restored
function PickupMatched(srcobj, theRegEx, replacedkeyTemplate){
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
        if (matchProcQuit !== null && matchProcRun === null ) {
            theRegEx = /proc&nbsp([\s\S])*?quit&#59/;
        } else if (matchProcQuit === null && matchProcRun !== null ) {
            theRegEx = /proc&nbsp([\s\S])*?run&#59/;
        } else if (matchProcQuit !== null && matchProcRun !== null) {
            // if none of the two are null, check and take the regex of which the matched str is shorter
            if (matchProcQuit[0] < matchProcRun[0] ) {
                theRegEx = /proc&nbsp([\s\S])*?quit&#59/i
                // console.log('getting content between proc and quit')
            } else {
                theRegEx = /proc&nbsp([\s\S])*?run&#59/i
                // console.log('getting content between proc and run')
            }
        } // else ? what if both are null? In that case it'll be skipped by the following program
    }
    
    
    if ( srcobj.replaced.match(theRegEx)!== null) {

        // get the matched string
        var theMatched =   srcobj.replaced.match(theRegEx)[0];

        // determine the length of the current .replacements (to be used as the index number)
        var replacedIndex = srcobj.replacements.length ;
        // have an empty obj as the replacement piece
        var replacement={}
        // .key of the replacement piece, which followings the specified template
        replacement.key = '___' + replacedIndex + '_' + replacedkeyTemplate  + '___';
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
        if(srcobj.replaced.match(theRegEx)!== null ){
            // console.log('recursively run PickupMatched')
            srcobj=PickupMatched(srcobj, theRegEx, replacedkeyTemplate)
        }
    }    
    return srcobj
} // end PickupMatched


// given a text, turn it into an object
// make text segments it into blocks and save in .block
// replacing text such as comments, datasteps, etc by a key, and save the replaced text into .replacements 
function codeToObj(theCodeText){

    // the src string is put into an obj, from this point, the rest are worked in that obj
    var initobj ={}
    initobj.origin = theCodeText;
    initobj.replaced=initobj.origin;
    initobj.replacements=[];

    // Note: must strictly follow the steps in order!!!

    //1. use the PickupMatched to extract multiple line comments an array
    //Note!!! do not use /gm, otherwise all of the matched strings will be replaced at the same time
    // Which is not what we want here. We want each mached string to be saved as different elements in .replacements
    var betweenmultilinecomments = /\/\*[\s\S]*?\*\//; //i.e., start with '/*', both escaped by \, and end with (?) '*/', also both escaped. in between, ([]), any length (*),not escaped, of white space chars (\s) and non-white space chars (\S)
    initobj = PickupMatched(initobj, betweenmultilinecomments, 'multilinecomments0824')

    //2. use the PickupMatched to extract single line comments start with %*
    var betweensinglelinecomments1 = /%\*[^(\r|\n|\r\n)]*?;/  ; // start with %*, end with ;, no line breakers in between (must be in a single line)
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
    var regex_betweenQuotes= /"([^"]*)"/
    initobj = PickupMatched(initobj, regex_betweenQuotes, 'quotes0824')


    //5. use the PickupMatched to extract contents between apostrophes into an array
    var regex_betweenApostrophes =/'([^']*)'/ 
    initobj = PickupMatched(initobj, regex_betweenApostrophes, 'apostrophes0824')


    //6. clean up whitespaces and line breakers between run and ; 
    //Note !!! Must be before step 8-11
    // console.log(console.log(text9.match(/run[ \t(\n|\r|\r\n)]*;/gmi)) // between run and ; (case insensitive), only contains white space or line breakers
    initobj.replaced=initobj.replaced.replace(/run[ \t(\n|\r|\r\n)]*;/gmi, 'run;') // for directly replacing all matched strings, it is ok to use the opiton /g

    //7. clean up whitespaces and line breakers between quit and ;
    //Note !!! Must be before step 8-11
    initobj.replaced=initobj.replaced.replace(/quit[ \t(\n|\r|\r\n)]*;/gmi, 'quit;')

    //8 clean up whitespaces between ; and link break 
    var re = /;[ \t]*\n/gmi
    initobj.replaced=initobj.replaced.replace(re, ';\n')

    //8. replace line breakers with br
    // rtext1 = initobj.replaced.replace(/\n/gm, '<br/>')
    initobj.replaced = initobj.replaced.replace(/\n/gm, '<br/>')


    //9. replace tab with nbsp
    // rtext2 = rtext1.replace(/\t/gm,'&nbsp&nbsp&nbsp&nbsp')
    initobj.replaced = initobj.replaced.replace(/\t/gm,'&nbsp&nbsp&nbsp&nbsp')

    //Note: !!! semicolons must be replaced after extracting single line comments. Otherwise the single line comments cannot be identified
    //10. replace semicolons with &#59 // Must having!!! otherwise for lines starting with whitespaces followed by a ';' (like '    ;' ), the ';' will be erased by this step!
    initobj.replaced = initobj.replaced.replace(/;/g, '&#59')    

    //11. replace white space with nbsp. It has to be after step8. Otherwise some semicolons will be erased
    var wtsp = /( )/g
    initobj.replaced=initobj.replaced.replace(wtsp, '&nbsp');

    //12 replace the datasteps
    regex_datasteps= /data&nbsp([\s\S])*?run&#59/i;
    initobj = PickupMatched(initobj, regex_datasteps, 'datasteps0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_datasteps0824___/gmi, '_datasteps0824___&#59')


    //13 things between proc and quit are a block
    regex_procs= /proc&nbsp([\s\S])*?quit&#59/i;
    initobj = PickupMatched(initobj, regex_procs, 'procs0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_procs0824___/gmi, '_procs0824___&#59')

    //finally replace content between ; and  <br/> as blocks
    initobj.blocks = initobj.replaced.split(/&#59<br\/><br\/>/m)

    return initobj;

} // end codeToObj()


function makeSubSteps(text){

    // turn the text into an obj with .blocks, and .replacements
    var targetobj= codeToObj(text)

    var j =0;
    var subnodes=[]
    //for each block, make it a piece of subnodedata, and push it into an array of subnodes
    targetobj.blocks.forEach( (d, i) =>{
        // get the contents of current block
        d_nowhitespaces = d.replace('<br/>', '').replace('&nbsp', '').replace('&#59', '').replace(/s/g, '')
        // console.log(d_nowhitespaces)
        if (d_nowhitespaces.length) {// if the block has non-whitespace content
            var thesubnodedata = {}
            thesubnodedata.idx = generateUUID();
            thesubnodedata.name = j++;
            var restoredtext =restoreReplaced(d, targetobj.replacements);
            /**the following is to replace semicolon, whitespace, tab, line breakers into html recognizable chars*/
            restoredtext=restoredtext.replace(/;/g, '&#59')
            restoredtext=restoredtext.replace(/(\r|\n|\r\n)/g, '<br/>')
            restoredtext=restoredtext.replace(/\t/g, '&nbsp&nbsp&nbsp&nbsp')
            restoredtext=restoredtext.replace(/( )/g, '&nbsp')
            // console.log(restoredtext)

            thesubnodedata.NodeDescription = '///t<br/>///s<br/>' + restoredtext + '<br/>s///<br/>t///'// restore the replaced text
            subnodes.push(thesubnodedata)
            
        }
    })

    // for each subnodes, get its following subnode as its child
    subnodes.forEach((d,i)=>{
        if (i < subnodes.length-1) { // if the current node is not the last 
            d.children=[];
            d.children.push(subnodes[i+1])
        }
    })

    // attache subnodes[0] to a node named substeps
    if (subnodes.length>0) {
        var substeps={}
        substeps.idx = generateUUID();
        substeps.name = 'substeps';
        substeps.children = [];
        substeps.children.push(subnodes[0])
    }

    // push substeps as the last child of the program node
    return substeps    
}



//restore the text by replacings the keys with original text
function restoreReplaced(t, r){
    //in t (the block text), find contents between ___ and ___
    var regex_key =/___[\s\S]*?___/; 
    var restoredt=t;
    if (t.match(regex_key) !== null){
        var thekey = t.match(regex_key)[0]
        valueToRestore = r[r.map(obj=>obj.key).indexOf(thekey)].value
        restoredt = t.replace(thekey, valueToRestore)
        // recursively, find the the again...
        if (restoredt.match(regex_key) !== null){
            restoredt= restoreReplaced(restoredt, r)
        }        
    }
    return restoredt
}

/**the above is related to adding substeps according to sas program from an egp file */
