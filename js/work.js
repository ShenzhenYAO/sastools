function showSearch(){	
	//display the input box
	if($("#searchBox").css('display')==="none"){
		$("#searchBox").css('display', "block");
		$("#searchBox").css('height', "auto");
//console.log($("#showSearchBtn").text())
		$("#showSearchBtn").text("hideSearch")//prop("value", "hideSearch");
	}else{
		$("#searchBox").css('display', "none");
		$("#searchBox").css('height', "0");	
		$("#showSearchBtn").text("showSearch");	
	}	
}