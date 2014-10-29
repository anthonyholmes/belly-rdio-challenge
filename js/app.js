/**
 * *****************************************
 * Reference URLs
 * *****************************************
 * https://github.com/bellycard/rdio-service
 * http://www.rdio.com/developers/docs/libraries/jquery/
 * https://github.com/rdio/jquery.rdio.js
 *
 * *****************************************
 * Challenge 1: JavaScript Audio Player
 * ******************************************
 *
 * Build a streaming audio player with your own design using our Rdio service and the
 * documentation for Rdio’s playback tokens. Refer to our README for more guidance.
 *
 * We’ve left the requirements open–ended and intentionally exposed more in the service
 * than you’ll likely want to implement – we value both technical ability and strong product sense.
 *
 * Submission requirements:
 *
 * Use of modern CSS/JS frameworks
 * Multiple UI states and UX interactions
 * Versioning on Github
 * Hosted on a service like Divshot, Nodejitsu, or Heroku
 * Backed by solid tests
 * Ask as many questions as you’d like, be as creative as you can, and most importantly, have fun with it!
 *
 * *****************************************
 * Endpoints
 * *****************************************
 * http://rdio-service.herokuapp.com/
 * GET        /albums?artist_id=...                    # Get a collection of albums for a given artist_id
 * GET        /albums/:album_id                        # Get an album for the given album_id
 * GET        /playlists/:playlist_id                  # Get a playlist for the given playlist_id
 * POST       /playback_tokens                         # Get a playback token
 * GET        /search?q=...                            # Get a collection of artists, albums, and tracks for the given q
 * GET        /tracks?artist_id=...                    # Get a collection of tracks for a given artist_id
 * GET        /tracks/:track_id                        # Get a track for the given track_id
 */

var rdioServiceUrl = 'http://rdio-service.herokuapp.com';

var playbackToken;

// Get the playback token if it doesn't exist in local storage
if(window.localStorage.playbackToken && window.localStorage.playbackToken.length > 0){
    playbackToken = window.localStorage.playbackToken;
    console.log('the token is stored');
} else{
    $.post(rdioServiceUrl + '/playback_tokens', function(returnedData){
        playbackToken = returnedData.data.playback_token;
        window.localStorage.playbackToken = playbackToken;
    });

    console.log('the token is not stored');
}

/**
 * ************************************
 * Search Functions
 * ************************************
 */

function searchRdio(query){
    $.get(rdioServiceUrl + '/search', {q: query}, function(data){
        console.log(data);
    });
}


var thePlayer = $('#the-player');

thePlayer.bind('ready.rdio', function() {
    $(this).rdio().queue('a171827');
  });

thePlayer.rdio(playbackToken);

/**
 * ******************************
 * Player Control Buttons
 * ******************************
 */

var playButton, pauseButton, stopButton;

playButton = $('#play-button');
pauseButton = $('#pause-button');
stopButton = $('#stop-button');

playButton.click(function(){
    thePlayer.rdio().play();
});

pauseButton.click(function(){
    thePlayer.rdio().pause();
});

stopButton.click(function(){
    thePlayer.rdio().stop();
});










