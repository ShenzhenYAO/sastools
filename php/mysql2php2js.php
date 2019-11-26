<?php

    //load the tools in phptoos.php
    //must have!!! as the function to connect to MySQL database is in that file
    include ('phptools.php'); //include the phptools

    //The following is received from posted json by $.post( "php/fromjs.php", jsontosend...
    // the posted json is like {sqltable: userid: ..., jsonstrname:..., jsonstr:...}

    //1. save the posted data into variables
    //echo $_POST['userid'];
    $sqltable =  $_POST['sqltable']; 
    $userid =  $_POST['userid']; 
    $jsonname = $_POST['jsonstrname']; 

    // Part 5 fetch the jsonstr (of the givien userid and jsonname) from sql table
    function mysqltophp($sqltable, $userid, $jsonname){
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees'    
        $theStatement = " select * from $sqltable where userid = $userid and jsonname= '$jsonname' ";
        if ($resultTmp = $dbc->query($theStatement)) { //$dbc->query($theStatement) is the same as mysqli_query($theMsSQLlink, $theStatement)

            /* fetch associative array */
            //mysqli-fetch-assoc gets data from the MySQL querry, and row by row, save into the variable $row
            //an associative array is an array that are flexible in naming the columns (e.g., using strings, $var['Word'], var['Meanings'], etc)
            // an numeric array only uses numbers to name the columns (e.g., $var[1][1], $var[1][2], etc)
            while($eachrow = mysqli_fetch_assoc($resultTmp)){
                $targetArray[] = $eachrow;//for each row, save the values in a row into the array $wordsToTest, which eventually has all rows and columns from the MySQL query
            }
            $resultTmp -> free();		
        }
        $dbc -> close();

        //reverse the hexadecimal code to binary code
        $receivedjsonstr = pack('H*', $targetArray[0]['jsonstr'] );
        // print_r($receivedjsonstr);

        //print the received jsonstr in this php, so as to be parsed to the js function that posted request to this php
        echo  $receivedjsonstr;

    }
    mysqltophp($sqltable, $userid, $jsonname); 

?>