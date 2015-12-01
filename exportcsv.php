<?php
header('Content-Type: text/csv');
$filename = $_POST['filename']
echo $filename;
header('Content-Disposition: attachment; filename="$filename"');
if (isset($_POST['csv'])) {
    $csv = $_POST['csv'];
    $rows = $csv.split('\n');
    $result = "";
	for ($i = 0;$i < count($rows);$i++){
		$row = $rows[$i];
    	for ($c = 0;$c < count($row);$c++){
    		$result .= $row[$c];
    		if ($c != count($row)-1){
    			$result .= ",";
    		}
    	}
    	$result .= "\n";
    }
   echo $result;
}
?>
