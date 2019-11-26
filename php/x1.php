<?php
    session_start();
?>
				
	<html>
		<form name="hiddenform" id="hiddenform" method="post" action="test.php">
            <input id="thejsonstr" name="thejsonstr" type="text"/>
            <input id="thejsonstrname" name="thejsonstrname" type="text"/>
            <input id="theuserid" name="theuserid" type="text"/>
		</form>
            <script type='text/javascript'>	

                document.getElementById("thejsonstr").value=sessionStorage.getItem("thejsonstr");
                document.getElementById("thejsonstrname").value=sessionStorage.getItem("thejsonstrname");
                document.getElementById("theuserid").value=sessionStorage.getItem("theuserid");
                document.forms["hiddenform"].submit();
			</script>
	</html>


