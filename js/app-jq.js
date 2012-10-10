/**
 * Script concernant les évenements traités avec jQuery et indépendant de OpenLayers
 * Auteur: G. Angéloz / Y. Lerjen - MIT38
 * Cours OGO avril 2012
 */

// $(document).ready(function(){  

$("#mappage").live('pageshow', function() {

	$("#score").html(score);

    // fix height of content
    function fixContentHeight() {
        var footer = $("div[data-role='footer']:visible"),
        header = $("div[data-role='header']:visible"),
        content = $("div[data-role='contentmap']:visible:visible"),
        viewHeight = $(window).height(),
        contentHeight = viewHeight - footer.outerHeight() - header.outerHeight();

        if ((content.outerHeight() + footer.outerHeight() + header.outerHeight()) !== viewHeight) {
            contentHeight -= (content.outerHeight() - content.height());
            content.height(contentHeight);
        }
        if (window.map) {
            map.updateSize();
        } else {
            // initialize map
            init(function(feature) {
                selectedFeature = feature;                
            });
        }
    };   

    $(window).bind("orientationchange resize pageshow", fixContentHeight);
    fixContentHeight();


//    $("#startGame").click(function(){
        if (locatecontrol.active) {
            locatecontrol.getCurrentLocation();
        } else {
            locatecontrol.activate();
        }

});	
//        $("#startGame").removeClass("ui-btn-active");
//        $("#startGame").addClass("ui-btn-inactive");
//    });
// });
// });

