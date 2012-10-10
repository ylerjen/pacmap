<?php
/** 
 * WebService à placer sur le serveur et permettant d'effectuer une requête sur 
 * le serveur PostGIS.
 * 
 * Utilisation : Retourne une string json contenant les détails du point (node
 * pgrouting) le plus proche de la longitude/lattitude passée en paramêtre.
 */
include('connection.php');

if( isset($_REQUEST['left']) && isset($_REQUEST['bottom']) && isset($_REQUEST['right']) && isset($_REQUEST['top']) ){
    
    $left=$_REQUEST['left'];
    $right=$_REQUEST['right'];
    $bottom=$_REQUEST['bottom'];
    $top=$_REQUEST['top'];
    
    
    
    //$sql="SELECT ST_AsText(the_geom) AS the_point,* FROM ways ORDER BY ST_Distance(the_geom,pointfromtext('POINT(".$lon." ".$lat.")',4326)) LIMIT 1";
    //$sql="SELECT POINT_TO_ID(GEOMFROMTEXT('POINT(".$lon." ".$lat.")',4326),0.001);";
    
    //x2,y2, source, target,
    $sql="SELECT x1,y1,x2,y2,source,target
        FROM ways
        WHERE the_geom && setsrid('BOX3D(".($left)." ".($bottom).", ".($right)." ".($top).")'::box3d, 4326)";
    
    $con = Connection::connect();
    
    $result=pg_query($con, $sql);
    
    $row = pg_fetch_assoc($result);
    
    $allresults= array();
    while($row = pg_fetch_assoc($result)){
        $allresults[]=$row;
    }
     echo json_encode($allresults);
     
}
else
    echo '<p>Missing param</p>';