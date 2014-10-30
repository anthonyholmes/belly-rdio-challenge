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

var thePlayer = $('#the-player');
var duration;

// When player is ready
thePlayer.bind('ready.rdio', function() {
    // $(this).rdio().queue('a975630');
    $(this).rdio().queue('t48620816');
    // id: "t48620816"length: 31name: "Love Someone"object_type: "search_result"radio_id: "sr48620816"
});

// When the track gets changed
thePlayer.bind('playingTrackChanged.rdio', function(e, playingTrack, sourcePosition) {
  if (playingTrack) {
    duration = playingTrack.duration;
    $('#track-image').attr('src', playingTrack.icon);
    $('#track-name').text(playingTrack.name);
    $('#album-name').text(playingTrack.album);
    $('#artist-name').text(playingTrack.artist);
    $('.fullscreen-bg').css('background-image', 'url(' + playingTrack.icon + ')');
  }
});

// When song position changes
thePlayer.bind('positionChanged.rdio', function(e, position) {
  $('#progress-bar').css('width', Math.floor(100*position/duration)+'%');
  console.log(position);
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
previousButton = $('#previous-button');
nextButton = $('#next-button');

playButton.click(function(){
    thePlayer.rdio().play();
});

pauseButton.click(function(){
    thePlayer.rdio().pause();
});

stopButton.click(function(){
    thePlayer.rdio().stop();
});

previousButton.click(function(){
    thePlayer.rdio().previous();
});

nextButton.click(function(){
    thePlayer.rdio().next();
});


/**
 * ************************************
 * Search Functions
 * ************************************
 */

var searchResults, albumResults, trackResults, artistResults;

function searchRdio(query){
    $.get(rdioServiceUrl + '/search', {q: query}, function(data){
        searchResults = data.data;
    });
}

$('.search-form').on('keyup', function(){
    inputData = $(this).val();
    searchRdio(inputData);

    albumResults = _.where(searchResults, {type: 'album'});
    artistResults = _.where(searchResults, {type: 'artist'});
    trackResults = _.where(searchResults, {type: 'track'});

    // Clear Results HTML
    albumResultsUL = $('#album-results');
    artistResultsUL = $('#artist-results');
    trackResultsUL = $('#track-results');

    albumResultsUL.html('');
    artistResultsUL.html('');
    trackResultsUL.html('');


    $.each(albumResults, function(k,v){
        albumResultsUL.append('<li>' + v.name + '</li>');
    })

    $.each(artistResults, function(k,v){
        artistResultsUL.append('<li>' + v.name + '</li>');
    })

    $.each(trackResults, function(k,v){
        trackResultsUL.append('<li>' + v.name + '</li>');
    })

});


