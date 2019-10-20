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
            console.log('fuck =================')
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