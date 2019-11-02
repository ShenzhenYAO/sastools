simple d3 v4 tree diagram.
commit 123a
1. Show hint box, on hint text input update the NodeDescription. Replace old tag (////clue ////) with new tags(///h h///)
2. Show/hind textview box on clicking the buttons

To do:
1. search
2. lock the selected node
3. the nicEdit bug
4. separately zoom in and out the text box, and the tree box

commit 122a

1. Add TextBox, and hintBox in the textviewbox
2. Selecting description text in textbox, the corresponding node will show up at the middle left of the tree map
3. Changes of description in textbox will be updated in nodes' description. Also, change in node's description will be updated into the text box if hitting the showTextBox button



commit 121a
1. change circle color if containing descriptions
2. turn label red if containing to do
3. debug of nicEdit.js. The original link is using http:// which is not allowed by netlify (has to be https://)
    therefore the nicEdit.js was downloaded and put in '/tool/nicEdit'. Two files are placed there. the gif must be there (for display icons).
    for makemodal() in components.js, the link to nicEdit.js was changed to 'tools/nicEdit/niceEdit.js
    also in nicEdit.js change was made to customize the gif path (change to: iconsPath : 'tools/nicEdit/nicEditorIcons.gif',)

to do:
1. Text link to nodes
2. text search , etc

Bugs: 
1) after bringing up the description modal, the nicEdit js is loaded, and when right click on the treerect it cause nicEdit to report error. 
2) when editing descript or renaming a node, the tree under the modal moves as mouse moves (how about when listening to mousedown/move, if a modal is open, do not move the treeG...)
3) nicEdit hyperlink not added, the hyperlink is always 'javascript:nicTemp()';


commit 120a
#########################################################
great milestone: having most functions ready!
#########################################################

1. Changed collapseAll(), collapse. If collapse to root, simulate a right click on the treerect to return to the default view of the root node
2. Enable expandAll() in the right click menu
3. Add description, fix the bug that description text cannot be edited.
    In function mousedown_pan(), disable the line:
        //////d3.event.preventDefault(); //!!! must have! to avoid text dragging
        // well it causes the description input modal stop working, do not use it!!!!)
4. In function inputTextChangeUpdate(), change the line to:
    var theDivs=d3.selectAll("div")['_groups'][0]; // d3v4, [0][0] does not work!
5. Bugs: 
1) after bringing up the description modal, the nicEdit js is loaded, and when right click on the treerect it cause nicEdit to report error.
2) when editing descript or renaming a node, the tree under the modal moves as mouse moves


commit 119a
1. debug doctype root node, right click collapse does not work (not a bug, just take time)
2. click elsewhere than the right click menu, the pan stop working
3. click x to close modal, pan stops
4. keep loading the same tree despite of changing source of local file to load


commit 118a
1. Rename node
2. Use the same function (makemodal() in work.js) to make modals

commit 117a

1. Us JavaScript to create the 'add new node 'modal, instead of using html

commit 116a
1. Right click menu
2. Collapse nodes when click the item 'collapse' in the right click menu
3. Delete a node when click the item 'delete node' in the right click menu
4. Build modals
5. Append a new node when click the item 'add node' in the right click menu
6. fixed the bug that after right click, the mouse is sticked for moving (the bug is fixed in 'd3.contextMenu' by adding 'd3.select(window).on('mousedown', null)') 

commit 115a

Export as an JSON to a local file

commit 114a

Create a new tree

commit 113a

Load file from URL and from local by functions readlocalfile(), and newTreebyJsonfromURL() in components.js

commit 19: 112a

1. simplify the executive.js, put the tree creating steps into NewTree() and move it to component.js
2. move estTreesize() into component.js. It is indepedent of NewTree()


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

