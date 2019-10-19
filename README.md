simple d3 v4 tree diagram. 
New:
right click to center and enlarge the selected node (by the function click2)
add d3v4 build-in zooming and pan functions:
svg.call(
    d3.zoom()
        .scaleExtent([1 / 2, 12])
        .on("zoom", zoomed) 
)