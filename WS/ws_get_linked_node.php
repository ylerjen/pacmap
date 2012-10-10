<?php 
/**
 * WebService à placer sur le serveur et permettant d'effectuer une requête sur 
 * le serveur PostGIS.
 * 
 * Utilisation : Retourne une string json contenant les détails des points
 * (node pgrouting) liés directement à celui dont l'id est passé en paramètre
 */
include('connection.php');

if(isset($_REQUEST['nodeid'])){
    
    $nodeid=$_REQUEST['nodeid'];
    
    //$nodeid=127002;
    $sql = "SELECT x1,y1,x2,y2,source,target FROM ways WHERE target = ".$nodeid." OR source = ".$nodeid;

    $con = Connection::connect();
    
    $result=pg_query($con, $sql);
    if (!$result)
        echo "<h1>CONNECTION ERROR</h1>";
    $allresults= array();
    while($row = pg_fetch_assoc($result)){
        $allresults[]=$row;
    }
     echo json_encode($allresults);
}
else
    echo '<p>Missing param</p>';