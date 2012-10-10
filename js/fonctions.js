    /**
 * Script concernant les fonctions réutilisables dans les scripts de l'app
 * Auteur: G. Angéloz / Y. Lerjen - MIT38
 * Cours OGO avril 2012
 */


/**
 * Déclaration des variables globales
 */
var pacmanImgPath='resources/img/Pacman.png';
var fantomeImgPath = 'resources/img/ghost_red.png';
var globeImgPath = 'resources/img/globe.png';
var pacman= new Array();
var nbFantome = 4;
var fantomeList = new Array();
var globeList = new Array();
var score = 0;
var index = 0; //'astuce' pour placer les fantômes seulement au 1er chargement de la map (comme appel ajax dans les transition, on doit effectuer ce type de contrôle)

//Variables de carte et layers + controles
var map;
var markersLayer;
var geolocate;
var vector;
var lineLayer;
var selectControlHover;
var selectControlClick;
var projection;
var init;
var locatecontrol;

//Variables définissant des projections
var proj900913 = new OpenLayers.Projection("EPSG:900913");
var proj4326 = new OpenLayers.Projection("EPSG:4326");

//Variables d'attribut pour les icones
var size = new OpenLayers.Size(20,20);
var sizeGlobe = new OpenLayers.Size(10,10);
var offset = new OpenLayers.Pixel(-(size.w/2), -size.h/2);

// variable de style pour les segments de directions
var style = {                
    strokeColor: '#ee9900',
    strokeOpacity: 0.8,
    strokeWidth: 6
};

/**
 * réécriture de la méthode activate pour les contrôles, afin de ne pas changer l'ordre d'affichage des couches !
 */
OpenLayers.Handler.Feature.prototype.activate = function() {
    var activated = false;
    if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
        //this.moveLayerToTop();
        this.map.events.on({
            "removelayer": this.handleMapEvents,
            "changelayer": this.handleMapEvents,
            scope: this
        });
        activated = true;
    }
    return activated;
};

/**
* Fonction créant un nombre aléatoire entre 2 nombres passés en paramêtre.
* 
* @param minVal est le nombre le plus petit pour la limite
* @param maxVal est le nombre le plus grand pour la limite
* @param floatVal est le nombre de chiffre après la virgule pour l'arrondi. S'il n'est pas défini, on n'arrondit pas.
* 
* @return le nombre généré
*/
function randomXToY(minVal,maxVal,floatVal){
    var randVal = minVal+(Math.random()*(maxVal-minVal));
    //return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
    return typeof floatVal=='undefined'?randVal:randVal.toFixed(floatVal);
}
    
/**
 * Fonction permettant de renvoyer une Longitude/lattitude aléatoire sur la carte
 * 
 * @param mapBounds est la zone de la carte au format OpenLayers.Bounds();
 * 
 * @return un objet LonLat de type OpenLayers.LonLat
 */
function getRandomPosOnMap(mapBounds){
    var zone = mapBounds.toArray();
    var randomLon = randomXToY(zone[0],zone[2]);
    var randomLat = randomXToY(zone[1],zone[3]);
    //    console.log(randomLon+" entre : "+zone[0]+" et "+zone[2]);
    //    console.log(randomLat+" entre : "+zone[1]+" et "+zone[3]);
    return new OpenLayers.LonLat(randomLon, randomLat);            
}

/**
 * Fonction placant un élément sur le noeud routier le plus proche de la
 * position lon/lat passée en paramêtre.
 * Fait appel au WS !
 * 
 * @param lon est la longitude du point de référence en projection 4326
 * @param lat est la latitude du point de référence en projection 4326
 * @param icon est l'icone a ajouter sur le layer, de type OpenLayers.Icon
 * @param idx est l'index du tableau de fantome afin de stocker le fantome et
 * sa position et de pouvoir y accéder ensuite. Si idx<0, cela correspond à PacMan
 * 
 */
function placeOnNearestNode(lon,lat,icon,idx){
    var node = new Array();    
    $.getJSON(
        "WS/ws_get_nearest_point.php",
        {
            lon: lon, 
            lat: lat                
        },
        function(node) {                    
            var lonLat = new OpenLayers.LonLat(node['lon'], node['lat']);            
            lonLat.transform(proj4326, proj900913);
            
            //On créé une variable pour stocker les informations du fantome.
            var fantome= new Array();
            fantome['marker']=new OpenLayers.Marker(lonLat, icon);
            fantome['nodeId']=node['id'];
            
            markersLayer.addMarker(fantome['marker']);
            if(idx>=0)
                fantomeList[idx]=fantome;
            else
                pacman=node['id'];            
        });   
}

/**
 * Fonction permettant de déplacer notre fantome sur le prochain point routier
 * de manière aléatoire.
 * 
 * @param idx est l'index du fantome dans la liste des fantomes
 */
function moveFantom(idxList){
    var currentFantome = fantomeList[idxList];
    var nextNodeListe=new Array();
    var compteur=0;
    if(currentFantome['nodeId']>=0){
        $.getJSON("WS/ws_get_linked_node.php",{
            nodeid: currentFantome['nodeId']           
        },
        function(data) {
            var arrayPoints = new Array();
                        
            //on construit un tableau 2 dimensions de points (x, y)
            $.each(data, function(i, node){
                var tempNode=findOtherNodePositionFromResult(currentFantome['nodeId'], node);
                if(isPositionInMap(tempNode['lon'], tempNode['lat'])){
                    nextNodeListe[compteur]=tempNode;
                    tempNode=null;
                    compteur++;
                }
            });
            //On choisi aléatoirement un point lié directement à celui où est le fantome
            var randomIdx = randomXToY(0, nextNodeListe.length, 0);                
            var nodeChoisi = nextNodeListe[randomIdx];
            //                console.log("NextNode : "+nodeChoisi);
            if(nodeChoisi)
            {
                var lonLat = new OpenLayers.LonLat(nodeChoisi.lon, nodeChoisi['lat']);                  
                lonLat.transform(proj4326, proj900913);                
                //On enlève le fantome du layer, on détruit l'objet et on le remplace par un nouveau.
                markersLayer.removeMarker(currentFantome['marker']);
                currentFantome['marker'].destroy();

                var iconFantom = new OpenLayers.Icon(fantomeImgPath,size,offset);
                var newFantome = new Array();
                newFantome['marker'] = new OpenLayers.Marker(lonLat, iconFantom);
                newFantome['nodeId'] = nodeChoisi['id'];
                fantomeList[idxList] = newFantome;
                markersLayer.addMarker(newFantome['marker']);
            //                currentFantome['marker'].moveTo(lonLat);          
            }                
        });                    
    }
}

/**
 * Check le resultat retourné par la requete et prend les informations du noeud
 * qui n'est pas le noeud courant, mais le noeud directement lié.
 */
function findOtherNodePositionFromResult(currentNodeId, data){
    var nodeInfos=new Array();    
    //    console.log("current node : "+currentNodeId);
    //    console.log("data recu : source "+data.source+":"+data.x1+" ou target "+data.target+":"+data.x2);
    if(currentNodeId == data.source) {
        nodeInfos['lon']=data.x2;
        nodeInfos['lat']=data.y2;
        nodeInfos['id']=data.target;
    //        console.log("node choisi : "+nodeInfos['id']+" ou "+data.target);
    }
    else{        
        nodeInfos['lon']=data.x1;
        nodeInfos['lat']=data.y1;
        nodeInfos['id']=data.source;
    //        console.log("node choisi : "+nodeInfos['id']+" ou "+data.source);
    }    
    //    console.log("node choisi : "+nodeInfos['id']);
    return nodeInfos;
}

/**
 * Controle si un point donné est dans la zone de carte qui est affichée
 * 
 * @param lon est la longitude en projection 4326
 * @param lat est la latitude en projection 4326
 * 
 * @return un boolean définissant si le point est dans la zone visible ou non
 */
function isPositionInMap(lon, lat){
    var inMap = false;
    var bounds = map.getExtent().toArray();    
    var lonLat = new OpenLayers.LonLat(lon, lat);
    lonLat.transform(proj4326, proj900913);
    
    if( (lonLat['lon'] > bounds[0] && lonLat['lon'] < bounds[2]) && (lonLat['lat'] > bounds[1] && lonLat['lat'] < bounds[3]) )
        inMap=true;   
    else
        inMap=false;
    return inMap;
}

/**
 * Fonction qui check si le fantome a rencontré le pacman et si c'est le cas on
 * termine la partie
 */
function checkGameOver(){
    for(var i=0;i<fantomeList.length;i++){
        var leFantome = fantomeList[i];
        if(pacman['nodeId']==leFantome['nodeId']){
            alert('GAME OVER ! \n SCORE: '+score);
            window.location = "index.html";
        }
    }
}

/**
 * On ajoute les pièces sur tous les noeuds contenus dans la BBOX
 */  
function placeGlobes() {        
    var bbox = map.getExtent();
    bbox.transform(proj900913, proj4326);     
    var array = bbox.toArray();

    $.getJSON("WS/ws_get_all_nodes.php", {
        left : array[0],
        bottom: array[1],
        right: array[2],
        top: array[3]
    },
    function(data) {        
        $.each(data, function(i, node) {
            var id1 = node.source;
            var lon1 = node.x1;
            var lat1 = node.y1;
            var point1 = new OpenLayers.LonLat(lon1, lat1);            

            var id2 = node.target;
            var lon2 = node.x2;
            var lat2 = node.y2;
            var point2 = new OpenLayers.LonLat(lon2, lat2);                    

            point1.transform(proj4326, proj900913);
            point2.transform(proj4326, proj900913);

            var icon = new OpenLayers.Icon(globeImgPath,sizeGlobe,offset); 

            if(!globeList[id1]) {
                var globeMarker1 = new OpenLayers.Marker(point1, icon);
                markersLayer.addMarker(globeMarker1); 
                globeList[id1] = globeMarker1;
        }
            if(!globeList[id2]) {
                var globeMarker2 = new OpenLayers.Marker(point2, icon);
                markersLayer.addMarker(globeMarker2);
                globeList[id2] = globeMarker2;
            }
        });        
    }
    )
}

function placePacMan (lonLatGPS, projection, icon) {
    
    placeGlobes();

    /**
     * appel ajax pour recupérer le noeuds le plus
     * proche des coordonnées obtenus par le GPS
     *
     * On utilise ensuite ce nouveau point pour y centrer la carte et y 
     * placer Pacman
     */        
    $.getJSON(
        "WS/ws_get_nearest_point.php",
        {
            lon: lonLatGPS.lon, 
            lat: lonLatGPS.lat                
        },
        function(data) {
            //                console.log(data);
            var lon = data.lon;
            var lat = data.lat;
            var nodeid = data.id;

            var lonLatAdjusted = new OpenLayers.LonLat(lon, lat);
            lonLatAdjusted.transform(proj4326, projection);               
            // var pacmanMarker = new OpenLayers.Marker(lonLatAdjusted, icon);
            pacman['marker'] = new OpenLayers.Marker(lonLatAdjusted, icon);
            pacman['nodeId'] = nodeid;
            markersLayer.addMarker(pacman['marker']);

            map.setCenter(lonLatAdjusted);
            map.zoomTo(16);
                   

            /**
         * appal ajax pour récupérer toutes les point de destination possibles (et compris dans la bbox) pour Pacman
         */
            $.getJSON(
                "WS/ws_get_linked_node.php",
                {
                    nodeid: nodeid           
                },
                function(data) { 
                        
                    //on construit un tableau de points (x, y)
                    $.each(data, function(i, node){
                        var arrayPoints = new Array();
                        if(node.source == nodeid) {                                  
                            var pointDest = new OpenLayers.Geometry.Point(node.x2, node.y2)
                            
                            if(isPositionInMap(pointDest.x, pointDest.y)) {
                                pointDest.transform(proj4326, projection);
                                var pointStart = new OpenLayers.Geometry.Point(lon, lat);
                                pointStart.transform(proj4326, projection);

                                arrayPoints.push(pointDest);
                                arrayPoints.push(pointStart);

                                var line = new OpenLayers.Geometry.LineString(arrayPoints);                            

                                var lineFeature = new OpenLayers.Feature.Vector(line, null, style);                            
                                lineLayer.addFeatures([lineFeature]);                            
                            }   

                        } else {                               
                            var pointDest = new OpenLayers.Geometry.Point(node.x1, node.y1)

                            if(isPositionInMap(pointDest.x, pointDest.y)) {
                                pointDest.transform(proj4326, projection);                                
                                var pointStart = new OpenLayers.Geometry.Point(lon, lat);
                                pointStart.transform(proj4326, projection);

                                arrayPoints.push(pointDest);
                                arrayPoints.push(pointStart);

                                var line = new OpenLayers.Geometry.LineString(arrayPoints);                            

                                var lineFeature = new OpenLayers.Feature.Vector(line, null, style);                            
                                lineLayer.addFeatures([lineFeature]);
                            }
                        }       
                        selectControlClick.activate();                        
                    });                   
                }); 
        });   
    }

/**
 * Déplace Pacman vers le noeuds choisit, puis déplace les fantomes aléatoirement.
 * Une fois tous les déplacements effectué, check si gameover.
 */
function movePacman(feature) { 
    checkGameOver();                         
    var nextPositionX = feature.geometry.components[0].x;
    var nextPositionY = feature.geometry.components[0].y;       
    var nextLonLatPacman = new OpenLayers.LonLat(nextPositionX, nextPositionY);
    nextLonLatPacman.transform(proj900913, proj4326);    

    var nextLonLat = new OpenLayers.LonLat(nextPositionX, nextPositionY);

    markersLayer.removeMarker(pacman['marker']);
    pacman['marker'].destroy();

    lineLayer.removeAllFeatures();

    $.getJSON("WS/ws_get_nearest_point.php", {
        lon: nextLonLatPacman.lon, 
        lat: nextLonLatPacman.lat   
    },
    function(data) {
        pacman['nodeId'] = data.id;                

        $.getJSON("WS/ws_get_linked_node.php", {
                nodeid: pacman['nodeId']
            },
            function(data) {
                $.each(data, function(i, node){
                    var arrayPoints = new Array();

                    if(node.source == pacman['nodeId']) {                                  
                        var pointDest = new OpenLayers.Geometry.Point(node.x2, node.y2)
                        pointDest.transform(proj4326, proj900913);
                        var pointStart = new OpenLayers.Geometry.Point(nextLonLat.lon, nextLonLat.lat);                            

                        arrayPoints.push(pointDest);
                        arrayPoints.push(pointStart);

                        var line = new OpenLayers.Geometry.LineString(arrayPoints);                            

                        var lineFeature = new OpenLayers.Feature.Vector(line, null, style);                            
                        lineLayer.addFeatures([lineFeature]);                             

                    } else {                               
                        var pointDest = new OpenLayers.Geometry.Point(node.x1, node.y1)
                        pointDest.transform(proj4326, projection);                                
                        var pointStart = new OpenLayers.Geometry.Point(nextLonLat.lon, nextLonLat.lat);                            

                        arrayPoints.push(pointDest);
                        arrayPoints.push(pointStart);

                        var line = new OpenLayers.Geometry.LineString(arrayPoints);                            

                        var lineFeature = new OpenLayers.Feature.Vector(line, null, style);                            
                        lineLayer.addFeatures([lineFeature]);
                        
                                                                                                                                     
                    }   

                    selectControlClick.activate();   
                    checkScore();                                            
                        
                });             
            }
        );
    });
    // console.log(globeList);
    

    var icon = new OpenLayers.Icon(pacmanImgPath,size,offset);
    pacman['marker'] = new OpenLayers.Marker(nextLonLat, icon);
    
    markersLayer.addMarker(pacman['marker']);                

    for(var i=0;i<fantomeList.length;i++){
        moveFantom(i);
    }

    checkGameOver();

}       


 function checkScore() {
                 
    if(globeList[pacman['nodeId']] != null) {
        var markerToDelete = globeList[pacman['nodeId']];        
        markersLayer.removeMarker(markerToDelete);
        markerToDelete.destroy();
        delete globeList[pacman['nodeId']];
        score = score+10;
        $("#score").html(score); 
    }
 }  


