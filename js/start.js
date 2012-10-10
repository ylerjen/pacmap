$(document).ready(function(){

   /**
    * Play theme song if HTML5 supporting browser
    */
    if (window.HTMLAudioElement) {
        var snd = new Audio('');

        if(snd.canPlayType('audio/mp3')) {
            snd = new Audio('resources/audio/pacman_theme.mp3');
            snd.play();
        }
    }
});