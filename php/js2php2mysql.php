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
    phptomysql($sqltable, $userid, $jsonname, $hexjsonstr);

?>