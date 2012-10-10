/**
 * Script concernant les évenements OpenLayers
 * Auteur: G. Angéloz / Y. Lerjen - MIT38
 * Cours OGO avril 2012
 */

/**
 * On supprime la barre d'adresse sur les Iphones et Ipod
 */


$("#mappage").live('pageshow', function() {
    index++;

var fixSize = function() {
    window.scrollTo(0,0);
    document.body.style.height = '100%';
    if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
        if (document.body.parentNode) {
            document.body.parentNode.style.height = '100%';
        }
    }
};
/**
 * Définition des contrôles
 */
var attrControl = new OpenLayers.Control.Attribution();
var touchControl = new OpenLayers.Control.TouchNavigation({
    dragPanOptions: {
        interval: 30,
        enableKinetic: true
    }
});

/**
 * Initialisation
 */
init = function() {
    // vector = new OpenLayers.Layer.Vector();
    geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',        
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
        }
    });

    //on crée la map       
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        controls: [      
            attrControl,
            // touchControl,        
            geolocate
        ],
        projection: proj900913,
//        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
        displayProjection: new OpenLayers.Projection("EPSG:900913"),        
        layers: [
        new OpenLayers.Layer.OSM("OpenStreetMap", null, {
            transitionEffect: 'resize'
        }),
        // vector
        ]
    });    

    /**
     * Ajout de la couche qui recevra les flèches des directions possibles
     */
    lineLayer = new OpenLayers.Layer.Vector("Line Layer"); 
    map.addLayer(lineLayer);  
    
    /**
     * Ajout des contrôles pour le hover et le select des flèches de la coucle lineLayer
     */
        selectControlClick = new OpenLayers.Control.SelectFeature(
           lineLayer,
           {    
                onSelect: movePacman                                       
           }
        );            

        // lineLayer.events.register("mouseover", lineLayer, onFeatureHover);

        // function onFeatureHover(feature) {
                        
        // }
    
        map.addControl(selectControlClick);                


    /**
     *Création du vecteur contenant le markeur de position
     */
    markersLayer = new OpenLayers.Layer.Markers( "Markers" );    
    map.addLayer(markersLayer);
    var icon = new OpenLayers.Icon(pacmanImgPath,size,offset);    

    geolocate.events.register("locationupdated",geolocate,function(e) {    

        var lonLatGPS = new OpenLayers.LonLat(e.point.x, e.point.y);
        // var lonLatGPS = new OpenLayers.LonLat(3684182, 5207957);
        projection = map.getProjectionObject();        
        // markers.addMarker(new OpenLayers.Marker(lonLat,icon));
        //vector.removeAllFeatures();
  

        map.setCenter(lonLatGPS);
        map.zoomTo(16);    


    /**
     * transformations des coordonées en ESPG:4326 pour le traitement côté serveur
     */              

        lonLatGPS.transform(projection, proj4326);                
        /** 
         * on place pacman a notre position GPS
         */
        placePacMan(lonLatGPS, projection, icon); 

        //Récupération de la taille de la carte affichée
        var bounds = map.getExtent();
        //Création et insertion des fantomes dans la map

        if(index<=1) {
            for(var idx=0;idx<nbFantome;idx++){
                //paramétrage du fantome
                var iconFantom = new OpenLayers.Icon(fantomeImgPath,size,offset);            
                var randomLonLat = getRandomPosOnMap(bounds);
                randomLonLat.transform(proj900913, proj4326);
                placeOnNearestNode(randomLonLat['lon'], randomLonLat['lat'],iconFantom,idx);            
            }
        }    
    });

    locatecontrol = map.getControlsBy("id", "locate-control")[0];  
};


});

