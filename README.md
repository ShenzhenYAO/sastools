simple d3 v4 tree diagram. 
*********************************************************************************************
commit 11:100c04
add a test1_mousedownmove.html to show how to trigger events when mouse is down, move, and up; show coordinates when  
 mouse is moved. 
add function getmousekey() to listen to and display the keys and mouse buttons
add function dragdrop() to drap and drop a node to change its parent. This is cool! Add '.on("mousedown", dragdrop)' when entering nodes [see MakeChangeTree() in components.js] to call back.  


commit 10:100c03
change names: ZoomInOutSelectedNode() instead of click2(), MakeChangeTree() instead of update()
add an option in executive.js, newtreeMethod, to select size() or nodeSize() methods 

commit 9: 100c02
use tree().nodeSize() method, adjust for error shift up of the nodeSize() method.

commit 8: 100c01
right click to center and enlarge the selected node (by the function click2)
add d3v4 build-in zooming and pan functions:
svg.call(
    d3.zoom()
        .scaleExtent([1 / 2, 12])
        .on("zoom", zoomed) 
)

commit 7: 100b02
split into 3 js files: init, components, and executive, loading in that order.
add transition to text fontsize and fill-opacity transition
add 

commit 6: 100b01
import JSON obj from external files

commit 1-5: 100_simpleV4
Copy from 100a and modify

