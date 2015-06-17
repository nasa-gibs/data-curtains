<?php

function httpGetWithErros($url)
{
    $ch = curl_init();  
 
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
 
    $output=curl_exec($ch);
 
    if($output === false)
    {
        echo "Error Number:".curl_errno($ch)."<br>";
        echo "Error String:".curl_error($ch);
    }
    curl_close($ch);
    return $output;
}
 
echo httpGetWithErros("https://api.echo.nasa.gov/catalog-rest/echo_catalog/granules.json?echo_collection_id[]=C7299610-LARC_ASDC&temporal[]=2015-01-01T00:00:00Z,2015-01-01T23:59:59Z");

?>
