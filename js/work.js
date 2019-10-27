/**
 * To determine the tree size...
 * Actually, just need to determine the height, as the width will be set by depth  * distance between nodes (horizontally)
 * 
 * The height is determined by the # of nodes without children? not right. 
 * 
 * But it has to be after running MakeChangeTree(), as the variable updateNode has to be updated by that function.
 *  updateNode contains nodes to be shown in the tree.
 * Or maybe not.
 * Suppose the data root has been changed (by clicking, or drag/drop), the value of .children has been changed. 
 * In that case, the root data is good enough to calculate the # of nodes without children!
 * 
 * Question: why the function 'getthistreesize()' was removed later....
 * 
 */


function getTreeSize(datapoint){
    
    var tmptreeinstance=d3.tree();
    var flatterneddatapoints =tmptreeinstance(datapoint).descendants();
    // console.log('flatterneddatapoints ===')
    // console.log(flatterneddatapoints)

    /**B.1.2.2 for each datapoint, get the sorted row and col number  */
    var flatterneddatapoints_sortedrowscols=getSortedRowsCols(flatterneddatapoints);

    /**B.1.2.3 get the maxrows and cols */
    var maxrowscols= getmaxrowscols(flatterneddatapoints_sortedrowscols)
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

    return {'width': width_tree, 'height': height_tree}

}