

function sendjsontest(){

    // console.log(rootdatapoint_sortedrowscols.data)
    // get the current json root data
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);
    sessionStorage.setItem('thejsonstr', jsonstr);
    // turn it into a blob
    //var theblob = new Blob([jsonstr], {type: "octet/stream"})

    // send the jsonstr to a session variable
    // console.log(sessionStorage.getItem('theuserid'))
    // console.log(sessionStorage.getItem('thejsonstrname'))
    // console.log(sessionStorage.getItem('thejsonstr'))

    //console.log(sessionStorage.getItem('thejsonblob'))
    // PHP to pick up such varialbe, and send to MySQL
    window.open('php/x1.php')

    setTimeout(function(){
        $.get('php/receivejson.txt', function(result){
            //get it back to json obj
            var receivedJSON = JSON.parse(result)
            // console.log(receivedJSON)
            NewTree(treeData)
        }, 'text')
        //delete the txt file ???

    }, 10000)

}

checkJSONPeriodically(10);	
function checkJSONPeriodically(interval_sec){
	let interval_ms = interval_sec * 1000;
	let timerId = setTimeout(function tick() {
            //must convert to text string, as the items stored in sessionStorage has to be strings.
            var theCurrentTreeData=JSON.stringify(rootdatapoint_sortedrowscols.data)
            var theLastTreeData=sessionStorage.getItem("thejsonstr")
            // console.log(theLastTreeData)
            if (theLastTreeData === theCurrentTreeData) {
                //console.log ("tree unchanged")
            }else{
                //console.log ("tree changed");
                //save the current grandroot into sessionStorage				
                sessionStorage.setItem("thejsonstr", theCurrentTreeData);
            }
            //repeat 
            timerId = setTimeout(tick, interval_ms); 
		}, interval_ms
	);		
}

