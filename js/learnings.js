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
    


