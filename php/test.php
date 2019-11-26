<?php
    //example to read from and write to MySQL databases 

    include ('phptools.php'); //include the phptools
    //session_start(); //it is critical to have it here, so as to remember all the global var values henceforward
    //if the above line is disabled, the session_start() does not remmeber the global value until the first line in login-success.php;
    //as such, the $_session['theusername'] on the login-success.php won't have any value;

    // Part 1 the following is to make a simple action: add a row 
    function part1 () {
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees';

        //prepare a str as SQL command
        $sql = 'insert into d3treejson (userid, jsonname, jsonstr) values(2,\'test2\', \'test\')';

        if (mysqli_query($dbc, $sql)) {
            echo "New record created successfully";
        } else {
        echo "Error: " . $sql . "" . mysqli_error($dbc);
        }

        //always close the connection;
        $dbc -> close();
    }
    //  Part 1

    /*Part 2 
        PHP sends a piece of record (i.e., the userid, jsonname, jsonstr) to MySQL. MySQL either update an
            existing record, or append the query as a new one. It is more efficient to send the query once, 
            and leave the rest jobs done on the MySQL side, instead of sending query, and receiving response
            back and forth. 
        To make it happen, we'll need to call a SQL procedure in MySQL by sending three parameters: i.e., userid, 
        jsonname, jsonstr. The procedure checks whether a row with the same userid, jsonname, and jsonstr 
        exists in the table d3treejson. If such a row is found, overwrite the record, else add a new row to 
        hold the record. 
    */
    function part2() {
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees';
        $sql = 'call update_insert_jsonstr(\'d3treejson\', 2, \'testnew\', \'theblob\')';
        if (mysqli_query($dbc, $sql)) {
            echo "New record created successfully";
        } else {
        echo "Error: " . $sql . "" . mysqli_error($dbc);
        }
    
        //always close the connection;
        $dbc -> close();
    }
    // part2();

    //Part 3, use parameters in PHP
    $sqltable = 'd3treejson'; 
    $userid =  $_POST['theuserid']; 
    $jsonname = $_POST['thejsonstrname']; 
    $posted_jsonstr = $_POST['thejsonstr'];
    //change the string from binary code to hexadecimal code
    $jsonstr=bin2hex($posted_jsonstr);
    // echo ('the blob to send is ');
    // echo ('<br/>');
    // print_r($jsonstr);


    function part3($sqltable, $userid, $jsonname, $jsonstr) {
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees';
        $sql = " call update_insert_jsonstr('$sqltable', $userid , '$jsonname', '$jsonstr') ";
        if (mysqli_query($dbc, $sql)) {
            echo "New record created successfully by php parameter";
        } else {
        echo "Error: " . $sql . "" . mysqli_error($dbc);
        }
    
        //always close the connection;
        $dbc -> close();
    }
    part3($sqltable, $userid, $jsonname, $jsonstr);


    // Part 4 fetch the jsonstr (of the givien userid and jsonname) from sql table
    function part4($jsonstr){
        $dbc = connectMySQL();//call the function connectMySQL to connect to MySQL, and open the database 'd3trees'    
        $theStatement = " select * from d3treejson where userid = 2 and jsonname= 'testnew2' ";
        if ($resultTmp = $dbc->query($theStatement)) { //$dbc->query($theStatement) is the same as mysqli_query($theMsSQLlink, $theStatement)

            /* fetch associative array */
            //mysqli-fetch-assoc gets data from the MySQL querry, and row by row, save into the variable $row
            //an associative array is an array that are flexible in naming the columns (e.g., using strings, $var['Word'], var['Meanings'], etc)
            // an numeric array only uses numbers to name the columns (e.g., $var[1][1], $var[1][2], etc)
            while($eachrow = mysqli_fetch_assoc($resultTmp)){
                $targetArray[] = $eachrow;//for each row, save the values in a row into the array $wordsToTest, which eventually has all rows and columns from the MySQL query
            }
            $resultTmp ->free();		
        }
        $dbc -> close();
        // print_r($targetArray); 
        // echo ($targetArray[0]['jsonstr']);
        if ($jsonstr === $targetArray[0]['jsonstr']) {
            echo "yes";
        }else{
            echo "no";
        }
    }
    // part4($jsonstr)

    // Part 5 fetch the jsonstr (of the givien userid and jsonname) from sql table
    function part5($sqltable, $userid, $jsonname, $jsonstr ){
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
            $resultTmp ->free();		
        }
        $dbc -> close();
        // print_r($targetArray); 
        // echo ($targetArray[0]['jsonstr']);
        // echo "<br/>";
        if ($jsonstr === $targetArray[0]['jsonstr']) {
            // echo "yes";
            // echo "<br/><br/>";
            // print_r($targetArray[0]['jsonstr']);
            // echo "<br/><br/>";

            //reverse the hexadecimal code to binary code
            $receivedjsonstr = pack('H*', $targetArray[0]['jsonstr'] );
            // print_r($receivedjsonstr);

            //write to an html file???
            $myfile = fopen("receivejson.txt", "w") or die("Unable to open file!");
            $txt = "$receivedjsonstr" ;
            fwrite($myfile, $txt);
            fclose($myfile);

            echo "<script>window.close();</script>";
        }else{
            echo "no";
        }
    }
    part5($sqltable, $userid, $jsonname, $jsonstr);   

?>
<script>
    //get contents from 
    console.log(document.getElementById("receive").innerHTML)
</script>
