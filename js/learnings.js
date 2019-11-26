// the following does not work as all gs are with translate mix of (0, 180)
// which is different from the values displayed in google chrome console.
function notrun(){
    var nodegroup_objs = g.selectAll('g.nodeGroup')._groups[0];
    // function to get  transform matrix
    function getVHTranslate(Eles){
        var translateHs=[], translateVs=[];
        nodegroup_objs.forEach(d => { // same as function(d) {}
            // console.log(d.transform.baseVal.consolidate().matrix)
            console.log(d3.select(d).attr('transform'))
            console.log('xxx =================')
            console.log(d)
            console.log(d.attributes.transform.value)
            var thetransformMatrix = d.transform.baseVal.consolidate().matrix;
            var e = thetransformMatrix.e;
            var f = thetransformMatrix.f;
            translateHs.push(e)
            translateVs.push(f)
        });
        result = {'horizontal': translateHs, 'vertical': translateVs};
        return result;
    }
    t = getVHTranslate(nodegroup_objs);
    console.log(t)

}


//the following part is to make a flying text when mouse is on the svg
function notrun (){


    svg
        .on('mouseover', showmousepositiontip)        
        .on('mouseout', hidemousepositiontip);
    
    
    function showmousepositiontip () {
        //a div must be created upfront and kept invisible (otherwise each time the mouse is over the rect, a new div will be created)
        //, translate it, and add mouse position as html
        var mouseH = d3.event.pageX, mouseV = d3.event.pageY;
        var translatestr = 'translate (' + mouseH + ', ' + mouseV + ')' ;
        themousepositiontip
            .transition()
            .duration(2200)
            .attr('transform', translatestr)
        ;
        var mouseHV = 'pageXY(' + mouseH + ', ' + mouseV + ')' + 'mouse(this)(' + parseInt(d3.mouse(this)[0]) + ', ' + parseInt(d3.mouse(this)[1]) + ')'; // the mouse.this is not even close: d3.mouse(this);// these is nothing to do with the svg position: svg.node().getBoundingClientRect().y
        themousepositiontip.select('text.mousepositiontiptext')
            .transition().duration(2200)
            .text(mouseHV)
            .style('opacity', '1')
            .attr("text-anchor", 'center')
    }
    
    function hidemousepositiontip(){
        var mouseH = 0, mouseV = 0;
        var translatestr = 'translate (' + mouseH + ', ' + mouseV + ')';
        themousepositiontip
            .transition().duration(2200)
            .attr('transform', translatestr)
        ;
        themousepositiontip.select('text.mousepositiontiptext')
        .transition().duration(2200)
        .style('opacity', '0')
        ;
    }
}


//simple mouse down move and up example still trying
function notrun (){

//https://bl.ocks.org/mbostock/4198499

d3.select("rect").on("mousedown", function() {

    var thissvg = d3.select(this);
  

    var w = d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);
    ;

    d3.event.preventDefault(); // disable text dragging

    var showstr=d3.mouse(thissvg.node())
    console.log(showstr)
    function mousemove() {

        themousepositiontip
        .attr('transform', 'translate(300,300)')
        ;

        mousetiptext
        .text(showstr)
        .style('opacity', '1')
        .attr("text-anchor", 'center')
    }

    function mouseup() {
        // div.classed("active", false);
        w.on("mousemove", null).on("mouseup", null);
      }


});

function notrun(){

https://bl.ocks.org/mbostock/4198499 

   
  d3.selectAll("div").on("mousedown", function() {
    var div = d3.select(this)
        .classed("active", true);
  
    var w = d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);
  
    d3.event.preventDefault(); // disable text dragging
  
    function mousemove() {
      div.text(d3.mouse(div.node()));
    }
  
    function mouseup() {
      div.classed("active", false);
      w.on("mousemove", null).on("mouseup", null);
    }
  });

}

}


// the following is to show how to wait for a period of time 
function notrun(){

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


}



//notworking zip.js
function notrun(){

// function ImportFromEGPAfterReloading(d){

//     // console.log(d)
//     //https://stackoverflow.com/questions/32267930/get-name-of-files-of-zip-file-in-javascript
//     var filesInput =d.files[0];

//     console.log(filesInput)

//     var reader = new FileReader();
//     reader.readAsBinaryString(filesInput);

//     reader.onloadend = function(e){
        
//         zip.useWebWorkers = false;//explicitly include (required) zip-workers ['zip.js','zip-fs.js','z-worker.js','inflate.js','deflate.js']

//         zip.createReader(new zip.BlobReader(filesInput), function(zipReader) {
//             zipReader.getEntries(readEntries);
//         }, function (error) {
//              console.log(error);
//         });


//         // var res;
//         // // unzip files
//         // console.log('unzip files ======')
//         // var myZip = e.target.result;  
//         // // console.log(myZip) 
//         // var unzipper = new JSUnzip(myZip);

//     //     unzipper.readEntries();    
//     //     var myFiles = unzipper.entries;    

//     //     for(var i=0; i<myFiles.length; i++) {
//     //         var name = myFiles[i].fileName; // This is the file name
//     //         var content = JSInflate.inflate(myFiles[i].data); // this is the content of the files within the zip file.
//     //     }
//     } 
// }


// function readEntries(entries) {
//     var entryLength = entries.length;
//     for (i = 0; i < entryLength; i++) {
//         var entry = entries[i];
//         // console.log(entry)
//         var post_lastslash = entry.filename.lastIndexOf("/");
//         if (post_lastslash ===0 ){
//             var filePath='';
//             var fileName=entry.filename
//         } else {
//            var filePath = entry.filename.substring(0, post_lastslash);
//             var fileName = entry.filename.substring(post_lastslash + 1); //if inside folder 
//         }
//         // console.log(entry.filename)
//         // console.log('path===========')
//         // console.log(filePath);
//         // console.log('file===========')
//         // console.log(fileName)
//         var ext = fileName.split(".").pop().toLowerCase();
//         if (ext.toUpperCase() == 'DOC' || ext.toUpperCase() == 'PDF' ||
//             ext.toUpperCase() == 'DOCX') {
//             //logic
//         }
//         if (ext==='xml'){

//             entry.getData(new zip.TextWriter(entry), function(text) {
//                 // text contains the entry data as a String
//                 // console.log(text);
//             })
//             // zip.createReader(new zip.BlobReader(filesInput), function(zipReader) {
//             //     zipReader.getEntries(readEntries);
//             // }, function (error) {
//             //      console.log(error);
//             // });



//         }      
        
//     }
// }


}


//create selectors mannually for quill rich text format
function CreateASelector_ItWorks(){

/**Create a customized quill rich text format */
//https://quilljs.com/playground/#class-vs-inline-style

//1. create a toolbar container
var qltoolbarbox = d3.select('body').append('div').attr('id', 'toolbar-container')

//1.a add ql-fontsize selector
var qlfontsizeselector=qltoolbarbox.append('span').attr('class', 'ql-formats')
  .append('select').attr('class','ql-size')

//1.b prepare a list of options (note: one of which is for default value 'selected', 'Default')
var fontsizedata=[
  {attr:'value', value:'10px', text:'s'},
  {attr:'selected',value:'', text:'Default'},
  {attr:'value',value:'18px', text:'L'},  
  {attr:'value',value:'32px', text:'XL'}
]

//1.c add options into the selector in a batch, link options to the data elements in fontsizedata data
var qlfontsizedata = qlfontsizeselector.selectAll('option')
  .data(fontsizedata) // data must be specified before enter()
  .enter()
  .append('option')
;

//1.d set attr for each option
qlfontsizedata
  .text(function(d){ return d.text})
  .attrs(function(d){
    var result={}
    var key=d.attr // this is the way to set parameter as key of an obj
    result[key] = d.value
    return result
  });
  //following is an alternative way to make attr like .attrs({value:'10px'}), or .attrs({selected:''})
  // .attrs({function(d){
  //   return d.attr + ':' + d.value
  // }})

}


// create customized Quill rich text format app
function createQuillAppUsingfunctions_itworks(){
    // Part 1 create a simple quill rich text format app
    //https://quilljs.com/docs/quickstart/
    function aSimpleQuillApp(){
      var theeditor = d3.select('body').append('div').attr('id', 'editor');
      theeditor.append('p').text('Hello World!')
      var p2= theeditor.append('p').html('Some initial <strong>bold</strong> text')
      var quill = new Quill('#editor', {
          theme: 'snow'
        });
    }
    //***End of part 1********************************************************* */
    // aSimpleQuillApp()

    /**Part 2 Create a customized quill rich text format */
    //https://quilljs.com/playground/#class-vs-inline-style
    function anInteractiveQuillApp(){
      
        //1. create a toolbar container
        var qltoolbarbox = d3.select('body').append('div').attr('id', 'toolbar-container')

        //1.a make ql-fontsize selector, an static example can be found in learning.js
        var selectorClassname = 'ql-size'
        // prepare a list of options (note: one of which is for default value 'selected', 'Default')
        var selectiondata=[
          {attr:'value', value:'10px', text:'Small'},
          {attr:'selected',value:'', text:'Normal'},
          {attr:'value',value:'18px', text:'Large'},  
          {attr:'value',value:'32px', text:'Huge'}
        ]
        makeqlSelector(qltoolbarbox,selectorClassname,selectiondata )


        //1.b make ql-fontcolor selector
        var selectorClassname = 'ql-color'
        // prepare a list of options (note: one of which is for default value 'selected', 'Default')
        var selectiondata=[
          {attr:'selected', value:'', text:''},
          {attr:'value',value:'blue', text:''},
          {attr:'value',value:'yellow', text:''}
        ]
        makeqlSelector(qltoolbarbox,selectorClassname,selectiondata )

        //1.c add ql-font background color
        var selectorClassname = 'ql-background'
        // prepare a list of options (note: one of which is for default value 'selected', 'Default')
        var selectiondata=[
          {attr:'selected', value:'', text:''},
          {attr:'value',value:'red', text:''},
          {attr:'value',value:'yellow', text:''},
          {attr:'value',value:'blue', text:''}
        ]
        makeqlSelector(qltoolbarbox,selectorClassname,selectiondata )

        //2. create an editor container
        var qledictorbox = d3.select('body').append('div').attr('id', 'editor-container')

        //3. registor and make the quill app
        var BackgroundClass = Quill.import('attributors/class/background');
        var ColorClass = Quill.import('attributors/class/color');
        var SizeStyle = Quill.import('attributors/style/size');
        Quill.register(BackgroundClass, true);
        Quill.register(ColorClass, true);
        Quill.register(SizeStyle, true);
        var quill = new Quill('#editor-container', {
            modules: {
              toolbar: '#toolbar-container'
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'
        });
    }
    /****part 2 an customized quill app*********************************************************************** */
    // anInteractiveQuillApp()


    //supporing functions

    // make a selector (e.g., a font size dropdown selector, a font color selector, etc.)
    // An static example can be found in learning.js (CreateASelector_ItWorks)
    function makeqlSelector(theqltoolbox,selectorClassname,selectiondata ){

      //1.a add ql selector
      var theqlselector=theqltoolbox.append('span').attr('class', 'ql-formats')
        .append('select').attr('class', selectorClassname)

      //1.b add options into the selector in a batch, link options to the data elements in the selectiondata obj 
      var theoptions = theqlselector.selectAll('option')
        .data(selectiondata) // data must be specified before enter()
        .enter()
        .append('option')
      ;
      //1.c set attr for each option
      theoptions
        .text(function(d){ return d.text})
        .attrs(function(d){
          var result={}
          var key=d.attr // this is the way to set parameter as key of an obj
          result[key] = d.value
          return result
        });
        //following is an alternative way to make attr like .attrs({value:'10px'}), or .attrs({selected:''})
        // .attrs({function(d){
        //   return d.attr + ':' + d.value
        // }})

    } //end of makeqlSelector

}


//following is a dumb function to read data from txt file

function notrun(){


  setTimeout(function(){
      $.get('php/receivejson.txt', function(result){
          //get it back to json obj
          treeData = JSON.parse(result)
          // console.log(receivedJSON)
          NewTree(treeData)
      }, 'text')
      //delete the txt file ???

  }, 10000)

}

