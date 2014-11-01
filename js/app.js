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
var thePlayer = $('#the-player');
var duration;

// Get the playback token if it doesn't exist in local storage
if(window.localStorage.playbackToken && window.localStorage.playbackToken.length > 0){
    playbackToken = window.localStorage.playbackToken;
    // Initialize the Player
    thePlayer.rdio(playbackToken);
    console.log('the token is stored');
} else{
    $.post(rdioServiceUrl + '/playback_tokens', {domain: window.location.host}, function(returnedData){
        playbackToken = returnedData.data.playback_token;
        window.localStorage.playbackToken = playbackToken;
        // Initialize the Player
        thePlayer.rdio(playbackToken);
    });

    console.log('the token is not stored');
}



// When Queue changes
thePlayer.bind('queueChanged.rdio', function(e, theQueue) {
  console.log('queue changed');

  $('#queue-qty').text(theQueue.length);

  var queueListings = $('#queue-listings');
  queueListings.html('');

  $.each(theQueue, function(i,v){
    $('#queue-listings').append(queueResultTemplate(v));
  });
  console.log(theQueue);
});

function queueResultTemplate(result){
    return "<li><div class='queue-listing-image'><img src='" + result.icon + "' /></div><div class='queue-listing-info'><div class='result-name'>"+result.name+"</div><div class='result-artist'>"+result.artist+"</div></div></li>";
}

// When player is ready
thePlayer.bind('ready.rdio', function() {
    $(this).rdio().queue('a975630');
    // $(this).rdio().queue('t48620816');
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
  // console.log(position);
});

// Play
thePlayer.bind('playStateChanged.rdio', function(e, playState) {
    var playPauseHidden = $('.hidden-player-control').attr('id');
    // console.log(playPauseHidden);
    if (playState == 0) { // paused
      if(playPauseHidden === 'play-button'){
        playButton.toggleClass('hidden-player-control');
        pauseButton.toggleClass('hidden-player-control');
      }
    } else {
      if(playPauseHidden === 'pause-button'){
        playButton.toggleClass('hidden-player-control');
        pauseButton.toggleClass('hidden-player-control');
      }
    }
});

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

var searchResults, albumResults, trackResults, artistResults, searchTimeout, loadingMessage;

// Clear Results HTML
albumResultsUL = $('#album-results');
artistResultsUL = $('#artist-results');
trackResultsUL = $('#track-results');

loadingMessage = $('.loading-results-section');

function searchRdio(query){
    $.ajax({
        url: rdioServiceUrl + '/search',
        data: {q: query},
        success: function(data){
            searchResults = data.data;

            // Filter Results
            albumResults = _.where(searchResults, {type: 'album'});
            artistResults = _.where(searchResults, {type: 'artist'});
            trackResults = _.where(searchResults, {type: 'track'});

            loadingMessage.slideUp();
            clearSearchResultsHtml();
            buildSearchResultsHtml();
        }
    });
}

$('.search-form').on('keyup', function(){
    inputData = $(this).val();

    window.clearTimeout(searchTimeout);

    // Search Form Blank
    if(inputData === ""){
        clearSearchResultsHtml();
        console.log('blank input');
    }
    // Search Form is less than 3 char
    else if(inputData.length < 3){
        clearSearchResultsHtml();
        console.log('search too short');
    }
    // Ok Let's Search
    else{
        searchTimeout = window.setTimeout(function(){
            searchRdio(inputData);
            // console.log('searching');

        }, 500);
    }

});

function clearSearchResultsHtml(){
    albumResultsUL.html('');
    artistResultsUL.html('');
    trackResultsUL.html('');
}

function buildSearchResultsHtml(){
    $.each(albumResults, function(k,v){
        albumResultsUL.append(searchResultTemplate(v));
    });

    // $.each(artistResults, function(k,v){
    //     artistResultsUL.append(searchResultTemplate(v));
    // });

    $.each(trackResults, function(k,v){
        trackResultsUL.append(searchResultTemplate(v));
    });

    // Search Result Actions
    $('.play-result').click(function(){
        resultId = $(this).data('rdio-id');
        thePlayer.rdio().play(resultId);
    });

    $('.queue-result').click(function(){
        resultId = $(this).data('rdio-id');
        thePlayer.rdio().queue(resultId);
    });
}

function searchResultTemplate(result){
    return "<li style=\"background-image: url(" + result.icon + ")\"><div class='result-name'>"+result.name+"</div><div class='hover-actions'><a href='javascript:;' class='play-result' data-rdio-id='" + result.id + "'><i class='fa fa-play'></i> Play this "+result.type+"</a><a href='javascript:;' class='queue-result' data-rdio-id='" + result.id + "'><i class='fa fa-plus'></i> Add "+result.type+" to Queue</a></div></li>";
}

// The Queue
$('#queue-heading').click(function(){
    $('#queue-body').slideToggle();
})


/**
 * icon: "http://img00.cdn2-rdio.com/album/4/3/3/0000000000421334/6/square-200.jpg"
 * id: "a4330292"
 * length: 22
 * name: "Sing"
 * object_type: "search_result"
 * type: "album"
 * url: "/artist/Ed_Sheeran/album/Sing/"
 *
 *
 * icon: "http://rdio3img-a.akamaihd.net/artist/no-artist-image-square.png"
 * id: "r3062875"
 * length: 10
 * name: "Ed Sheeran"
 * object_type: "search_result"
 * type: "artist"
 * url: "/artist/Ed_Sheeran_1/"
 *
 *
 * icon: "http://img00.cdn2-rdio.com/album/4/3/3/0000000000421334/6/square-200.jpg"
 * id: "t46823439"
 * length: 31
 * name: "Sing"
 * object_type: "search_result"
 * radio_id: "sr46823439"
 * type: "track"
 * url: "/artist/Ed_Sheeran/album/Sing/track/Sing/"
 */



