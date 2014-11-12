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

var window, playbackToken, duration, searchTimeout;
var rdioServiceUrl = 'http://rdio-service.herokuapp.com';
var thePlayer = $('#the-player');
var playbackToken = 'GAlUVAgn_____3h4NWV0bXZiNThiNDRqOGVmOXQ3cG4zdWxvY2FsaG9zdGEiuZGizYQG__z3RIph0is=';
var loadingMessage = $('.loading-results-section');

// Start Angular
var bellyRdioApp = angular.module('bellyRdioApp', []);

bellyRdioApp.controller("bellyRdioAppController", ['$scope', '$http', function ($scope, $http) {
  $scope.queueQty = 0;
  $scope.thePlayer = document.getElementById('the-player');
  $scope.duration = 0;

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
  };

  thePlayer.bind('ready.rdio', function () {
    thePlayer.rdio().queue('a975630');
  });

  thePlayer.bind('queueChanged.rdio', function (e, theQueue) {

    $scope.$apply(function () {
      $scope.queueQty = theQueue.length;
      $scope.queueListings = theQueue;
    });

  });

  // When the track gets changed
  thePlayer.bind('playingTrackChanged.rdio', function (e, playingTrack, sourcePosition) {

    $scope.$apply(function () {
      if (playingTrack) {
        duration = playingTrack.duration;
        $scope.trackPlaying = {
          icon: playingTrack.icon,
          name: playingTrack.name,
          album: playingTrack.album,
          artist: playingTrack.artist
        };
      }
    });

  });

  // When song position changes
  thePlayer.bind('positionChanged.rdio', function (e, position) {
    $scope.$apply(function () {
      $scope.duration = Math.floor(100 * position / duration) + '%';
    });
  });

  // Play State Changes
  thePlayer.bind('playStateChanged.rdio', function (e, playState) {
    var playPauseHidden = $('.hidden-player-control').attr('id');
    var playButton = $('#play-button');
    var pauseButton = $('#pause-button');
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

  // Actions

  $scope.playResult = function (id) {
    thePlayer.rdio().play(id);
  };

  $scope.queueResult = function (id) {
    thePlayer.rdio().queue(id);
  };

  // Player controls
  $scope.play = function () {
    thePlayer.rdio().play();
  };

  $scope.pause = function () {
    thePlayer.rdio().pause();
  };

  $scope.stop = function () {
    thePlayer.rdio().stop();
  };

  $scope.previous = function () {
    thePlayer.rdio().previous();
  };

  $scope.next = function () {
    thePlayer.rdio().next();
  };

  // Initialize the Player
  thePlayer.rdio(playbackToken);

}]);

// The Queue
$('#queue-heading').click(function () {
  $('#queue-body').slideToggle();
});
