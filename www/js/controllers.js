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

.controller('ListCtrl',['$scope', 'TDCardDelegate', 'List', 'Fire', 'OMDB', '$ionicHistory',
 function($scope, TDCardDelegate, List, Fire, OMDB, $ionicHistory) {

  if (List.index >= List.currentList.length - 1){
    List.index = 0;
  }

  //holds cards and info about each card

  $scope.cards = [];

  //gets info for and adds first 10 cards to dom
  var firstTen = function(i, n){
    var called = {0: true};
    if (n - i === 10){
      $scope.addCard(List.currentList[i], firstTen(i + 1, n));
    } else {
      $scope.$on('nextImage', function () {
        if (i < n && !called[i]){
          called[i] = true;
          $scope.addCard(List.currentList[i], firstTen(i + 1, n));
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
    if ($scope.cards.length === 1){
      $scope.cards.splice(index, 1);
      $ionicHistory.goBack();
    }
    $scope.cards.splice(index, 1);
    $scope.addCard();
  };

  //adds card to back
  $scope.addCard = function(newId, cb) {
    newId = newId || List.currentList[List.index++];
    if (newId){
      var newCard = {
        uid: newId,
        image: "http://img.omdbapi.com/?i=" + newId + "&apikey=" + OMDB_API + "&h=318",
      };

      OMDB.getMovie(newId).then(function(res){
        newCard.data = res;
        newCard.data.YearD = '(' + newCard.data.Year + ')';
        $scope.cards.unshift(newCard);
        if (cb){
          cb();
        }
      }, function(err){
        console.log(err);
      });
    }
  };

  $scope.cardSwipedLeft = function(index) {
    Fire.updateMovie({
      uid: $scope.cards[index].uid,
      seen: false,
      desire: false
    }, 'notInterested');
  };
  $scope.cardSwipedRight = function(index) {
    Fire.updateMovie({
      uid: $scope.cards[index].uid,
      seen: false,
      desire: true
    }, 'watchList');
  };

  //saves rating to firebase and removes top card
  $scope.rate = function(rating){
    Fire.updateMovie({
      uid: $scope.cards[$scope.cards.length - 1].uid,
      seen: true,
      rating: rating
    }, 'rated');
    $scope.cardDestroyed($scope.cards.length - 1);
  };

  (function init(){
    firstTen(List.index, List.index += 10);
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
}])

.controller('MyMoviesCtrl', ['$scope', 'List', function($scope, List){
  $scope.categories = List.myLists;
  $scope.setList = function(index){
    List.myCurrentList = List.myLists[index];
  };
}])

.controller('MyListCtrl', ['$scope', 'Fire', 'OMDB', 'List', function($scope, Fire, OMDB, List){
  $scope.searchText = '';
  $scope.movies = Fire.getMovies(List.myCurrentList.child);
  $scope.pageTitle = List.myCurrentList.title;

}])

.directive('noScroll', ['$document', function($document) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  };
}])

.directive('imageonload', [function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        //call the function that was passed
        scope.$apply(attrs.imageonload);
      });
    }
  };
}]);
