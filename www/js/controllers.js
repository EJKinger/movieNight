angular.module('movieNight.controllers', ['ionic.contrib.ui.tinderCards'])

.controller('AccountCtrl', ["$scope", "Auth", function($scope, Auth) {
  // This is the success callback from the login method
  
  $scope.facebookSignIn = function() {
    Auth.facebookSignIn();
  };

  $scope.facebookSignOut = function(){
    Auth.facebookSignOut();
  };

  $scope.test = function(){
    Auth.test();
  };
}])

.controller('DashCtrl', function($scope) {})

.controller('ChatDetailCtrl', function($scope, $stateParams, Lists) {
  $scope.list = Lists.get($stateParams.listId);
})

.controller('MoviesCtrl', ['$scope', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
  });
}])

.controller('ListsCtrl', ['$scope', 'Lists', function($scope, Lists){
  $scope.lists = Lists.all();
}])

.controller('ListCtrl', function($scope, TDCardDelegate, $firebaseObject, omdbService, $http, listService, Fire) {
  //holds cards and info about each card
  $scope.cards = [];

  //gets info for and adds first 10 cards to dom
  var firstTen = function(i, n){
    var called = {0: true};
    if (n - i === 10){
      $scope.addCard(listService.currentList[i], firstTen(i + 1, n));
    } else {
      $scope.$on('nextImage', function () {
        if (i < n && !called[i]){
          called[i] = true;
          $scope.addCard(listService.currentList[i], firstTen(i + 1, n));
        }
      });
    }
  };

  //broadcasts nextImage event, this allows the images to be loaded synchronously
  $scope.next = function(){
    $scope.$broadcast('nextImage');
  };

  //removes card
  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
    $scope.addCard();
  };

  //adds card to back
  $scope.addCard = function(newId, cb) {
    newId = newId || listService.currentList[listService.index++];
    var newCard = {
      uid: newId,
      image: "http://img.omdbapi.com/?i=" + newId + "&apikey=" + OMDB_API + "&h=318",
    };

    $http({
      method: 'get',
      url: "http://www.omdbapi.com/?i=" + newId
    }).then(function(res){
      newCard.data = res.data;
      newCard.data.YearD = '(' + newCard.data.Year + ')';
      $scope.cards.unshift(newCard);
      if (cb){
        cb();
      }
    }, function(err){
      console.log(err);
    });
  };

  $scope.cardSwipedLeft = function(index) {
    Fire.updateMovie({
      uid: $scope.cards[index].uid,
      seen: false
    });
  };
  $scope.cardSwipedRight = function(index) {
    Fire.updateMovie({
      uid: $scope.cards[index].uid,
      seen: true
    });
  };

  //saves rating to firebase and removes top card
  $scope.rate = function(rating){
    Fire.updateMovie({
      uid: $scope.cards[$scope.cards.length - 1].uid,
      rating: rating
    });
    $scope.cardDestroyed($scope.cards.length - 1);
  };

  $scope.stars = function(card, index){
    // console.log(index);
    // console.log(card);
    // console.log($scope.cards[index]);
  }

  (function init(){
    firstTen(listService.index, listService.index += 10);
  }());
//MOVIE DATA res.data = {}
  //data: Object
    // Actors: "Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler"
    // Awards: "Nominated for 7 Oscars. Another 14 wins & 20 nominations."
    // Country: "USA"
    // Director: "Frank Darabont"
    // Genre: "Crime, Drama"
    // Language: "English"
    // Metascore: "80"
    // Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    // Poster: "http://ia.media-imdb.com/images/M/MV5BODU4MjU4NjIwNl5BMl5BanBnXkFtZTgwMDU2MjEyMDE@._V1_SX300.jpg"
    // Rated: "R"
    // Released: "14 Oct 1994"
    // Response: "True"
    // Runtime: "142 min"
    // Title: "The Shawshank Redemption"
    // Type: "movie"
    // Writer: "Stephen King (short story "Rita Hayworth and Shawshank Redemption"), Frank Darabont (screenplay)"
    // Year: "1994"
    // imdbID: "tt0111161"
    // imdbRating: "9.3"
    // imdbVotes: "1,590,699"
})

.controller('RatedCtrl', ['$scope', 'Fire', function($scope, Fire){
  $scope.ratedMovies = [];

}])

.directive('noScroll', function($document) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  };
})

.directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        //call the function that was passed
        scope.$apply(attrs.imageonload);
      });
    }
  };
});
