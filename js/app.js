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

var window, playbackToken, duration;
var rdioServiceUrl = 'http://rdio-service.herokuapp.com';
var thePlayer = $('#the-player');

/**
 * ******************************
 * Angular
 * ******************************
 *
 */
var bellyRdioApp = angular.module('bellyRdioApp', []);

bellyRdioApp.controller("bellyRdioAppController", ['$scope', '$http', function ($scope, $http) {

  $scope.search = function (e) {
    // On letter number or backspace or enter
    if ((e.keyCode <= 90 && e.keyCode >= 48) || e.keyCode === 8 || e.keyCode === 13) {
      window.clearTimeout(searchTimeout);

      if ($scope.searchInput === "") {
        $scope.albumResults = {};
        $scope.trackResults = {};
        loadingMessage.slideUp();
      } else if ($scope.searchInput.length < 2) {
        $scope.albumResults = {};
        $scope.trackResults = {};

      } else {
        loadingMessage.slideDown();
        searchTimeout = window.setTimeout(function () {

          $http.get(rdioServiceUrl + '/search', { params: { q: $scope.searchInput } } )
            .success(function (data) {
              loadingMessage.slideUp();
              $scope.albumResults = _.where(data.data, {type: 'album'});
              $scope.trackResults = _.where(data.data, {type: 'track'});
            });


        }, 500);
      }
    }
  }

}]);

/**
 * ******************************
 * Playback Token
 * ******************************
 * Gets the playback token if not stored in local storage
 */

if (window.localStorage.playbackToken && window.localStorage.playbackToken.length > 0) {
  playbackToken = window.localStorage.playbackToken;

  // Initialize the Player
  thePlayer.rdio(playbackToken);
} else {
  $.post(rdioServiceUrl + '/playback_tokens', {domain: window.location.host}, function (returnedData) {
    playbackToken = returnedData.data.playback_token;
    window.localStorage.playbackToken = playbackToken;

    // Initialize the Player
    thePlayer.rdio(playbackToken);
  });
}

/**
 * ******************************
 * Player Control Buttons
 * ******************************
 */

var playButton = $('#play-button');
var pauseButton = $('#pause-button');
var stopButton = $('#stop-button');
var previousButton = $('#previous-button');
var nextButton = $('#next-button');

playButton.click(function () {
  thePlayer.rdio().play();
});

pauseButton.click(function () {
  thePlayer.rdio().pause();
});

stopButton.click(function () {
  thePlayer.rdio().stop();
});

previousButton.click(function () {
  thePlayer.rdio().previous();
});

nextButton.click(function () {
  thePlayer.rdio().next();
});

/**
 * ************************************
 * Event Listeners
 * ************************************
 */

// When player is ready
thePlayer.bind('ready.rdio', function () {
  $(this).rdio().queue('a975630');
  // $(this).rdio().queue('t48620816');
});

var queueResultTemplate = function (result) {
  return "<li><div class='queue-listing-image'><img src='" + result.icon + "' /></div><div class='queue-listing-info'><div class='result-name'>" + result.name + "</div><div class='result-artist'>" + result.artist + "</div></div></li>";
};

// When Queue changes
thePlayer.bind('queueChanged.rdio', function (e, theQueue) {

  $('#queue-qty').text(theQueue.length);

  var queueListings = $('#queue-listings');
  queueListings.html('');

  $.each(theQueue, function (i, v) {
    $('#queue-listings').append(queueResultTemplate(v));
  });

});

// When the track gets changed
thePlayer.bind('playingTrackChanged.rdio', function (e, playingTrack, sourcePosition) {
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
thePlayer.bind('positionChanged.rdio', function (e, position) {
  $('#progress-bar').css('width', Math.floor(100 * position / duration) + '%');
});

// Play
thePlayer.bind('playStateChanged.rdio', function (e, playState) {
  var playPauseHidden = $('.hidden-player-control').attr('id');
  if (playState === 0) { // paused
    if (playPauseHidden === 'play-button') {
      playButton.toggleClass('hidden-player-control');
      pauseButton.toggleClass('hidden-player-control');
    }
  } else {
    if (playPauseHidden === 'pause-button') {
      playButton.toggleClass('hidden-player-control');
      pauseButton.toggleClass('hidden-player-control');
    }
  }
});

/**
 * ************************************
 * Search Functions
 * ************************************
 */

var searchResults, albumResults, trackResults, searchTimeout, resultId;

// Clear Results HTML
var albumResultsUL = $('#album-results');
var trackResultsUL = $('#track-results');
var loadingMessage = $('.loading-results-section');

var clearSearchResultsHtml = function () {
  albumResultsUL.empty();
  trackResultsUL.empty();
}

var searchResultTemplate = function (result) {
  return "<li style=\"background-image: url(" + result.icon + ")\"><div class='result-name'>" + result.name + "</div><div class='hover-actions'><a href='javascript:;' class='play-result' data-rdio-id='" + result.id + "'><i class='fa fa-play'></i> Play this " + result.type + "</a><a href='javascript:;' class='queue-result' data-rdio-id='" + result.id + "'><i class='fa fa-plus'></i> Add " + result.type + " to Queue</a></div></li>";
}

var buildSearchResultsHtml = function () {
  $.each(albumResults, function (k, v) {
    albumResultsUL.append(searchResultTemplate(v));
  });

  $.each(trackResults, function (k, v) {
    trackResultsUL.append(searchResultTemplate(v));
  });

  // Search Result Actions
  $('.play-result').click(function () {
    resultId = $(this).data('rdio-id');
    thePlayer.rdio().play(resultId);
  });

  $('.queue-result').click(function () {
    resultId = $(this).data('rdio-id');
    thePlayer.rdio().queue(resultId);
  });
}

var searchRdio = function (query) {
  $.ajax({
    url: rdioServiceUrl + '/search',
    data: {q: query},
    success: function (data) {
      searchResults = data.data;

      // Filter Results
      albumResults = _.where(searchResults, {type: 'album'});
      trackResults = _.where(searchResults, {type: 'track'});

      loadingMessage.slideUp();
      clearSearchResultsHtml();
      buildSearchResultsHtml();
    }
  });
}

// $('.search-form').on('keyup', function (e) {

//   // On letter number or backspace or enter
//   if ((e.which <= 90 && e.which >= 48) || e.which === 8 || e.which === 13) {
//     var inputData = $(this).val();

//     window.clearTimeout(searchTimeout);

//     if (inputData === "") { // Search Form Blank
//       clearSearchResultsHtml();
//       loadingMessage.slideUp();
//     } else if (inputData.length < 2) { // Too Short
//       clearSearchResultsHtml();
//       loadingMessage.slideUp();
//     } else { // Let's Search
//       loadingMessage.slideDown();
//       searchTimeout = window.setTimeout(function () {
//         searchRdio(inputData);
//       }, 500);
//     }
//   }

// });

// The Queue
$('#queue-heading').click(function () {
  $('#queue-body').slideToggle();
});
