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

.controller('MoviesCtrl', function($scope, TDCardDelegate, $firebaseObject, omdbService, $http) {
  var ref = new Firebase("https://luminous-torch-3475.firebaseio.com");
  var obj = $firebaseObject(ref);

  var cardTypes = movieData;
  $scope.cards = Array.prototype.slice.call(cardTypes, 0);

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newId = omdbService.genID();
    //var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];

    var newCard = {
      uid: newId,
      movie: "xxxx",
      image: "http://img.omdbapi.com/?i=tt" + newId + "&apikey=" + OMDB_API + "&h=318",
    };
    $http({
      method: 'get',
      url: "http://www.omdbapi.com/?" + newId + "&"
    }).then(function(res){
      console.log(res);
      newCard.info = res;
    }, function(err){
      console.log(err);
    });

    //newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  };
  $scope.cardSwipedLeft = function(index) {
    console.log(obj[$scope.cards[index].info]);
    obj[$scope.cards[index].uid] = {seen: false};
    obj.$save();
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    obj[$scope.cards[index].uid] = {seen: true};
    obj.$save();
    $scope.addCard();
  };
});
