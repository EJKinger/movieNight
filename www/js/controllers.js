angular.module('movieNight.controllers', ['ionic.contrib.ui.tinderCards'])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
  });

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, Auth, $location) {
  $scope.authData = Auth.authData;

  $scope.login = function() {
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      //controller gets reloaded and this never gets called.
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });

};

  $scope.logout = function(){
    Auth.$unauth();
    $location.path('/landing');
  };

  $scope.test = function(){
    console.log(Auth.authData);
  };
})

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

//res.data = {}
// data: Object
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



.controller('MoviesCtrl', function($scope, TDCardDelegate, $firebaseObject, omdbService, $http, listService) {
  var ref = new Firebase("https://luminous-torch-3475.firebaseio.com");
  var obj = $firebaseObject(ref);
  var usersRef = ref.child('users');

  $scope.cards = [];

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
    $scope.addCard();
  };

  $scope.addCard = function(newId, push, index) {
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
      if (push){
        $scope.cards[index] = newCard;
      } else {
        $scope.cards.unshift(newCard);
      }
      //$scope.cards.push(angular.extend({}, newCard));
    }, function(err){
      console.log(err);
    });
  };


  
  $scope.cardSwipedLeft = function(index) {
    obj[$scope.cards[index].uid] = {seen: false};
    obj.$save();
  };
  $scope.cardSwipedRight = function(index) {
    obj[$scope.cards[index].uid] = {seen: true};
    obj.$save();
  };
  $scope.currentTitle = function(index){
    return $scope.cards[index].data.Title;
  };

  $scope.rate = function(index, rating){
    var uid = $scope.cards[index].uid;
    console.log(rating);
    obj.child(uid).update({rating: rating});
    obj.$save();
    $scope.cardDestroyed(index);
  };

  (function addCards(){
    for (var i = listService.index; i < listService.index + 10; i++){
      $scope.addCard(listService.currentList[i], true, 9 - i);
    }
    listService.index += 10;
  }());

});
