<?php

$jsonname = "1.txt";

//the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/145a/data
//$_SERVER['DOCUMENT_ROOT'] returns 'F:/Personal/Virtual_Server/PHPWeb/'

//the parent folder of the current php file is like /d3egp2019/145a/
$parentfolder = dirname(dirname($_SERVER['REQUEST_URI']));

//the txt file need to be saved into F:/Personal/Virtual_Server/PHPWeb/d3egp2019/145a/data
$targetfilefullpath = $_SERVER['DOCUMENT_ROOT'].$parentfolder."/data/".$jsonname;

// //write the jsonstr as txt file to server
$myfile = fopen("$targetfilefullpath", "w") or die("Unable to open file!");
// $txt = $_POST['jsonstr'];
$txt = 'something';
fwrite($myfile, $txt);
fclose($myfile);

?>