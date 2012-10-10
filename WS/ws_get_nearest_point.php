<?php 
/**
 * WebService à placer sur le serveur et permettant d'effectuer une requête sur 
 * le serveur PostGIS.
 * 
 * Utilisation : Retourne une string json contenant les détails du point (node
 * pgrouting) le plus proche de la longitude/lattitude passée en paramêtre.
 */
include('connection.php');

if(isset($_REQUEST['lon']) && isset($_REQUEST['lat'])){
    
    $lat=$_REQUEST['lat'];
    $lon=$_REQUEST['lon'];
    
    
    
    //$sql="SELECT ST_AsText(the_geom) AS the_point,* FROM ways ORDER BY ST_Distance(the_geom,pointfromtext('POINT(".$lon." ".$lat.")',4326)) LIMIT 1";
    //$sql="SELECT POINT_TO_ID(GEOMFROMTEXT('POINT(".$lon." ".$lat.")',4326),0.001);";
    
    //x2,y2, source, target,
    $sql="SELECT x1,y1,x2,y2,source,target, distance(the_geom,GeometryFromText('POINT(".$lon." ".$lat.")',4326)) AS dist
        FROM ways
        WHERE the_geom && setsrid('BOX3D(".($lon-0.1)." ".($lat-0.1).", ".($lon+0.1)." ".($lat+0.1).")'::box3d, 4326)
        ORDER BY dist
        LIMIT 1";
    
    $con = Connection::connect();
    
    $result=pg_query($con, $sql);
    
    $row = pg_fetch_assoc($result);
    
    if (!$row)
        echo "<p>no result</p>";
    else{
        $compare = "SELECT ST_Distance(pointfromtext('POINT(".$row['x1']." ".$row['y1'].")',4326), pointfromtext('POINT(".$lon." ".$lat.")',4326) ) AS T1, 
    ST_Distance(pointfromtext('POINT(".$row['x2']." ".$row['y2'].")',4326), pointfromtext('POINT(".$lon." ".$lat.")',4326) ) AS T2";

        $result=pg_query($con, $sql);    
        $row2 = pg_fetch_assoc($result);
        $nearestPoint = array();
        if($row2['T1']<$row2['T2']){
            $nearestPoint['lon']=$row['x1'];        
            $nearestPoint['lat']=$row['y1'];      
            $nearestPoint['id']=$row['source'];
        }
        else{
            $nearestPoint['lon']=$row['x2'];        
            $nearestPoint['lat']=$row['y2'];       
            $nearestPoint['id']=$row['target'];       
        }
        echo json_encode($nearestPoint);
    }
    /*
     * 
     * 
     * 
    if (!$result)
        echo "<h1>CONNECTION ERROR</h1>";
    
    $row = pg_fetch_assoc($result);
    if (!$row)
        echo "<p>no result</p>";
    else
        echo json_encode($row);
     * */
     
}
else
    echo '<p>Missing param</p>';