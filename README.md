simple d3 v4 tree diagram. 

commit 18: 111a

1. Fix bug: cross update .children._children for their depth (recursively), as well as ._children.children in the dragdrop function in component.js



*********************************************************************************************
commit 17:110a

$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$  Important milestone: The tree is now enabled for:
$    - zoom in and out
$    - pan
$    - drag and drop to change node relationships
$    - draw customized links
$    - tree size updated as show/hide nodes or relationship of notes changed
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
1. Change localStorage back to sessionStorage, still works properly. The keeping refreshing issue is rather caused by document.location.reload(), which should be stopped after reloading. (see the function document_reload() in components.js)
2. Automatically change the tree size as changes are made (e.g., show/hide nodes, drag and drop to change parents). Specifically, the automation is achieved by new lines before MakeChangeTree() to recalculate the treesize, redefine the vertical middle point of the first node, and update the tree instance with newly proposed tree size. 




commit 16:109a
1. add setTimeout to wait for 3 seconds, and get the final treeG size after waiting for all jobs are done
2. add tests of different tree() method settings (with/without specifying tree width and height) in executive.js
3. fixed the size of the svg and the treerect. Let the size be the same as the treeview box - borderweight
4. using localStorage items instead of sessionStorage items to save loaded json. That way, the constant refreshing issue    disappears. 


commit 15:108a
1. make customized link (custlink() in component.js) 
2. make changes in MakeChangeTree(), return nodeUpdate (an d3 obj of nodes shown in the tree not including those hidden)

commit 14:107a

1. two boxes, left for text, right for tree diagram. The tree diagram zoom in/out function is adapted
2. fix the bug: update depth for hidden children (in _children of the selected node object in drag and drop)
3. add pan [function pan()]
4. add stopPropagation() in function dragdrop (in component.js)

commit 13:106a

Debug, in components.js:
1. change pseudonodeG property setting using parameters set in init.js
2. put mouseover, null setting after running makechangetree()
3. when mouse out, set circle fill color according to whether show/hide descendants
4. make change tree use rootdatapoint_sortdrowscols

commit 12:105a
put all parameter settings in init.js
instead of <text>, use foreignObject, and div which is more flexible for multiple lines and text formating
 (an test page is created: test2_foreignobj.html)


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

