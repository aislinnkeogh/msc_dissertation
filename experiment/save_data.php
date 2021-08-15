<?php
$json = file_get_contents('php://input');
$obj = json_decode($json, true);
// Change next line to the location on your server where you would like to save data
$server_data = '/home/wwwakeoghpplseda/data/new_cactus/main';
$path = $server_data."/".$obj["filename"];
if (substr(realpath(dirname($path)), 0, strlen($server_data))!=$server_data) {
    error_log("attempt to write to bad path: ".$path);
} else {
    $outfile = fopen($path, "a");
    fwrite(
        $outfile,
        sprintf($obj["filedata"])
    );
    fclose($outfile);
}
?>
