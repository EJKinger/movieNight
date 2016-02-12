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

// .controller('AccountCtrl', function($scope, Auth, $location) {
//   $scope.authData = Auth.authData;

//   $scope.login = function() {
//     Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
//       //controller gets reloaded and this never gets called.
//     }).catch(function(error) {
//       if (error.code === "TRANSPORT_UNAVAILABLE") {
//         Auth.$authWithOAuthPopup("facebook").then(function(authData) {
//         });
//       } else {
//         console.log(error);
//       }
//     });

// };

//   $scope.logout = function(){
//     Auth.$unauth();
//     $location.path('/landing');
//   };




.controller('AccountCtrl', function($scope, $state, $q, $ionicLoading, Auth) {
  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }
    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      Auth.setUser(profileInfo);
      $ionicLoading.hide();
      $state.go('tab.dash');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    if (window.cordova.platformId == "browser") {
      facebookConnectPlugin.browserInit(1036634036356683);
      // version (second argument) is optional. It refers to the version of API you may want to use.
    }
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        //var user = UserService.getUser('facebook');

        if(!Auth.getUser()){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            Auth.setUser(profileInfo);
            $state.go('tab.dash');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        } else{
          Auth.setUser(profileInfo);
          $state.go('tab.dash');
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };

  $scope.facebookSignOut = function(){
    $ionicLoading.show({
      template: 'Logging out...'
    });

    // Facebook logout
    facebookConnectPlugin.logout(function(){
      $ionicLoading.hide();
      $state.go('landing');
    },
    function(fail){
      $ionicLoading.hide();
      alert('logout failed', fail);
    });
  };

  $scope.test = function(){
    console.log(Auth.getUser());
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
    obj[$scope.cards[index].uid] = {seen: false};
    obj.$save();
  };
  $scope.cardSwipedRight = function(index) {
    obj[$scope.cards[index].uid] = {seen: true};
    obj.$save();
  };

  //saves rating to firebase and removes top card
  $scope.rate = function(rating){
    //var uid = $scope.cards[index].uid;
    console.log(rating + " " + $scope.cards[$scope.cards.length - 1].data.Title);
    // obj.child(uid).update({rating: rating});
    // obj.$save();
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

});
