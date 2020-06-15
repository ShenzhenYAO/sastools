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
    //echo $_POST['jsonstrname'];
    //convert the binary jsonstr into hexadecimal str (so as to avoid escaping problmes for apostrophes, and quotes)
    $hexjsonstr=bin2hex($_POST['jsonstr']);
    //echo $hexjsonstr;

    $sendtomysql=$_POST['sendtomysql'];

    //save the jsonstr as a text file in the server folder
    //the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/145a/data
    //$_SERVER['DOCUMENT_ROOT'] returns 'F:/Personal/Virtual_Server/PHPWeb/'

    //the parent folder of the current php file is like /d3egp2019/145a/
    $parentfolder = dirname(dirname($_SERVER['REQUEST_URI']));
    // echo "parentfolder is ".$parentfolder;
    //the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/145a/data
    $targetfilefullpath = $_SERVER['DOCUMENT_ROOT'].$parentfolder."/data/".$jsonname;

    // //write the jsonstr as txt file to server
    $myfile = fopen("$targetfilefullpath", "w") or die("Unable to open file!");
    $txt = $_POST['jsonstr'];
    fwrite($myfile, $txt);
    fclose($myfile);

    //2. use 'phptomysql' to insert/update hex jsonstr saved in the mysql table 'd3treejson'
    function phptomysql($sqltable, $userid, $jsonname, $jsonstr) {
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees';
        $sql = " call update_insert_jsonstr('$sqltable', $userid , '$jsonname', '$jsonstr') ";
        if (mysqli_query($dbc, $sql)) {
            echo "JSON str successfully saved to MySQL table";
        } else {
            echo "Error: " . $sql . "" . mysqli_error($dbc);
        }    
        //always close the connection;
        $dbc -> close();
    }
    if ($sendtomysql !== 'n') {
        phptomysql($sqltable, $userid, $jsonname, $hexjsonstr);
    }
    

?>