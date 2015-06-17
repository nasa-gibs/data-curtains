<?php
$sel_date = $_POST['date'];

function queryECHO($url)
{
    $ch = curl_init();  
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($url, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Accept: application/json'
));
    $output=curl_exec($ch);
 
    if($output === false)
    {
        echo "Error Number:".curl_errno($ch)."<br>";
        echo "Error String:".curl_error($ch);
    }
    curl_close($ch);
    $feed = json_decode($output,true)['feed'];
    $entries = $feed['entry'];
    return $entries;
}
 
$metadata = queryECHO("https://api.echo.nasa.gov/catalog-rest/echo_catalog/granules.json?echo_collection_id[]=C7299610-LARC_ASDC&temporal[]=".$sel_date."T00:00:00Z,".$sel_date."T23:59:59Z");

echo "<h3>Calipso Meta-Data</h3>";
echo "Selected Date: ".$sel_date."<br><br>";

for ($i = 0; $i < count($metadata); $i++) {
    echo "Entry Number: ".($i+1)."<br>";
    echo "Orbit: ".$metadata[$i]['day_night_flag']."<br>";
    $start_time = substr($metadata[$i]['time_start'], strlen($sel_date)+1,8);
    echo "Start Time: ".$start_time."<br>";
    $end_time = substr($metadata[$i]['time_end'], strlen($sel_date)+1,8);
    echo "End Time: ".$end_time."<br>";
    for($j = 0; $j < count($metadata[$i]['lines']); $j++)
    echo "Coordinates: ".$metadata[$i]['lines'][$j]."<br>";
    echo "<br><br>";
} 

?>
