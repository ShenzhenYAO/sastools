
//when key word is input and click the 'OK' button, run and return search results
function searchCluesbyKey(){
	//empty the search result box
	$('#searchResult').empty();
	//get the search keyword
	var theKeyword = $('#searchinput').val();
//console.log(theKeyword)
	if (theKeyword ===""){return;}
	//get the search results;
	var theSearchResults = searchInClues(theKeyword);
	// //display it in the search box;
	// theSearchResults.forEach(function(d){
	// 	$('#searchResult').append(
	// 		d.sentence + "<br/>" + "<span style='font-size:12px;'>[" + d.name + "]" + "[" + d.idx + "]" + "</span><p/>"
	// 	)
	// })	
	// if (theSearchResults.length===0){
	// 	$('#searchResult').append("Nothing found.");
	// }
} //searchCluesbyKey

//search for th results on the current page
function searchInClues(thekeyword){

    // get data points of all g nodes
    var allnodesdata= d3.selectAll('g.nodeGs').data();
    // console.log(allnodesdata)

    //define the regex of key word  (all incidences, ignore case)
    var theRegKeyWord = new RegExp(thekeyword, 'ig');

    // loop for each data point
    allnodesdata.forEach(d=>{
        // get the html in d.data.NodeDescription
        if (d.data.NodeDescription !== undefined ){
            // console.log(d.data.NodeDescription)
            // the NodeDescription is like a string of HTML (<p><image></image></p>)
            // it is really unnecessary to strip the html tags, but the following function does the trick anyway
            var descTxt=extractContent(d.data.NodeDescription, true)
            console.log(descTxt)
            //split sentences by ".! or ?"
			var theSegments =descTxt.split(/[.!?]+/);
			theSegments.forEach(function(e){

				if (theRegKeyWord.test(e)){
					//replace the searched word with bold html
					e=e.replace(theRegKeyWord, function(str){
						return "<span style='font-weight:bold;font-style:italic;font-size:20px'>" + str + "</span>"
					})
					//remove the asterisks (like *************)
					e=e.replace(/\*/g, "");
					//push the matched sentences into the result array
					searchResult.push({idx:d.idx, name:d.name, sentence:e})
				}
			})

            // var descHTML = $.parseHTML(d.data.NodeDescription);
            // console.log(descHTML)
            // // get text from descHTML;
            // if (descHTML !== undefined ){
            //     var descTxt=[]
            //     descHTML.forEach(e=>{
            //         console.log(e)
            //         var eTxt=$.parseHTML(e) //.innerText()
            //         console.log(eTxt)                     
            //     })
            // }
        }// end if
    })

	var searchResult=[];
	var theClues=getNodeClues(theJSON);
//console.log(theClues)
		theClues.forEach(function(d){
			//split sentences by "., or ?"
			var theSegments = d.clue.split(/[.!?]+/);
//console.log(theSegments);
			theSegments.forEach(function(e){
				//define the regex of key word  (all incidences, ignore case)
				var theRegKeyWord = new RegExp(thekeyword, 'ig');
				if (theRegKeyWord.test(e)){
					//replace the searched word with bold html
					e=e.replace(theRegKeyWord, function(str){
						return "<span style='font-weight:bold;font-style:italic;font-size:20px'>" + str + "</span>"
					})
					//remove the asterisks (like *************)
					e=e.replace(/\*/g, "");
					//push the matched sentences into the result array
					searchResult.push({idx:d.idx, name:d.name, sentence:e})
				}
			})
		});
// console.log(searchResult)
		// return searchResult;
} // searchInClues


// a function to extract text contents from html strings
// https://stackoverflow.com/questions/28899298/extract-the-text-out-of-html-string-using-javascript/28899585
function extractContent(s, space) {
    var span= document.createElement('span');
    span.innerHTML= s;
    if(space) {
        var children= span.querySelectorAll('*');
        for(var i = 0 ; i < children.length ; i++) {
        if(children[i].textContent)
            children[i].textContent+= ' ';
        else
            children[i].innerText+= ' ';
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g,' ');
    };

//search for each element in the nodeclues, make an array of the clues matching the search results
function searchInClues_bk(theJSON, thekeyword){
	var searchResult=[];
	var theClues=getNodeClues(theJSON);
//console.log(theClues)
		theClues.forEach(function(d){
			//split sentences by "., or ?"
			var theSegments = d.clue.split(/[.!?]+/);
//console.log(theSegments);
			theSegments.forEach(function(e){
				//define the regex of key word  (all incidences, ignore case)
				var theRegKeyWord = new RegExp(thekeyword, 'ig');
				if (theRegKeyWord.test(e)){
					//replace the searched word with bold html
					e=e.replace(theRegKeyWord, function(str){
						return "<span style='font-weight:bold;font-style:italic;font-size:20px'>" + str + "</span>"
					})
					//remove the asterisks (like *************)
					e=e.replace(/\*/g, "");
					//push the matched sentences into the result array
					searchResult.push({idx:d.idx, name:d.name, sentence:e})
				}
			})
		});
//console.log(searchResult)
		return searchResult;
} // searchInClues