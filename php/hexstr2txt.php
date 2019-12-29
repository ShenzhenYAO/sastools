<?php
    //load the tools in phptoos.php
    //must have!!! as the function to connect to MySQL database is in that file
    include ('phptools.php'); //include the phptools

    //The following is received from posted json by _POST 
    // the posted json is like {binstr: <the binary stringified json string>}

    //1. save the posted data into variables
    //echo $_POST['binstr'];
    $binstr =  $_POST['binstr']; 

    //convert the binary jsonstr into hexadecimal str (so as to avoid escaping problmes for apostrophes, and quotes)
    $hexstr=bin2hex($binstr);
    //echo $hexstr;

    //save the hexstr as a text file in the server folder
    //the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/153a/data
    //$_SERVER['DOCUMENT_ROOT'] returns 'F:/Personal/Virtual_Server/PHPWeb/'

    //define the temptxt name
    $tmptxtname = 'tmphexstr.txt'

    //the parent folder of the current php file is like /d3egp2019/153a/
    $parentfolder = dirname(dirname($_SERVER['REQUEST_URI']));
    // echo "parentfolder is ".$parentfolder;
    //the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/153a/data
    $targetfilefullpath = $_SERVER['DOCUMENT_ROOT'].$parentfolder."/data/".$tmptxtname;

    //write the jsonstr as txt file to server
    $myfile = fopen("$targetfilefullpath", "w") or die("Unable to open file!");
    $txt = $_POST['hexstr'];
    fwrite($myfile, $txt);
    fclose($myfile);
?>