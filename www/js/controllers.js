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
  $scope.settings = {
    enableFriends: true
  };

  $scope.login = function() {
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      $scope.authData = authData;
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

.controller('MoviesCtrl', function($scope, TDCardDelegate, $firebaseObject) {
  var ref = new Firebase("https://luminous-torch-3475.firebaseio.com");
  var obj = $firebaseObject(ref);

  var cardTypes = movieData;
  $scope.cards = Array.prototype.slice.call(cardTypes, 0);

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  };
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    obj[$scope.cards[index]] = "NOPE";
    obj.$save();
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    obj[$scope.cards[index]] = "LIKE";
    obj.$save();
    $scope.addCard();
  };
});
