var window, playbackToken, duration, searchTimeout;
var rdioServiceUrl = 'http://rdio-service.herokuapp.com';
var thePlayer = $('#the-player');
var loadingMessage = $('.loading-results-section');

$.post(rdioServiceUrl + '/playback_tokens', {domain: window.location.host}, function (returnedData) {
   var playbackToken = returnedData.data.playback_token;

   // Initialize the Player
     thePlayer.rdio(playbackToken);
 });

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

}]);

// The Queue
$('#queue-heading').click(function () {
  $('#queue-body').slideToggle();
});
