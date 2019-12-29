// send jsonstr from js to a php which converts the jsonstr into hexstr, and save as a text 
function postbinstr2php(){
    //get the most recent json data
    var jsonstr = JSON.stringify(rootdatapoint_sortedrowscols.data);
    //prepare a json obj with keys including slqtable, josnstr, userid, and jsonstrname
    //note: the stringified jsonstr is only 1 element of the json obj
    var 
        v1=sessionStorage.getItem('thejsonstr', jsonstr),
        jsontosend = {
            jsonstr:v1
        }

    // Post the json data to a php file, and receive response text echoed on that php file
    //https://api.jquery.com/jQuery.post/
    // The jquery way is simply to specify: 1) the target php, 2) the name of the json data 3) the data type.

    var jqxhr = $.post( 
        "php/hexstr2txt.php", 
        jsontosend, 
        'json'
        )
        // the following is to return the contents printed on the target php, so that user can 
        // moniter whether the target php runs normally or having errors.
        .done(function(d) {
            console.log( 'On php/hexstr2txt.php:\n' + d );
    }) // end post
} // end postbinstr2php()
