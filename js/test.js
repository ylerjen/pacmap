alert('hello'); 
//Si on a l'autorisation de geolocaliser 
if(navigator.geolocation){ 
var scriptTag = '<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>'; 
document.write(scriptTag); 
	function succesGeo(position){ 
		var infopos = &laquo;&nbsp;Ma position => &laquo;&nbsp;; 
		infopos += &laquo;&nbsp;Latitude: &laquo;&nbsp;+position.coords.latitude+&nbsp;&raquo; &#8211; &laquo;&nbsp;; 
		infopos += &laquo;&nbsp;Longitude: &laquo;&nbsp;+position.coords.longitude; 
		document.getElementById(&laquo;&nbsp;position&nbsp;&raquo;).innerHTML = infopos; 
 		//instancier un objet coordonnée google maps selon l'API 
		var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); 
 		//option pour centrer la carte sur notre position 
		var optionsGMaps = { 
			mapTypeControl: false, 
			center: latlng, 
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}, 
			mapTypeId: google.maps.MapTypeId.ROADMAP, 
			zoom: 15 
		}; 
 		//initialiser la carte selon nos paramêtres 
		var map = new google.maps.Map(document.getElementById(&laquo;&nbsp;mapGoogle&nbsp;&raquo;), optionsGMaps); 
 		//ajout d'un &laquo;&nbsp;flag&nbsp;&raquo; sur notre position 
		var marker = new google.maps.Marker({ 
			position: latlng, 
			map: map, 
			title: &laquo;&nbsp;Votre emplacement !&nbsp;&raquo; 
		}); 
	} 
 	//requête de géolocalisation 
	navigator.geolocation.getCurrentPosition(succesGeo); 
} 