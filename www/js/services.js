angular.module('movieNight.services', ['firebase'])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory("Fire", [function(){
  var ref = new Firebase("https://luminous-torch-3475.firebaseio.com/data/users");
  var user = JSON.parse(localStorage.getItem("userData"));

  var fireUpdateUser = function(userData){
    var userRef = ref.child(user.id);
    //object with data to send to firebase
    var updateData = {
      age_range: userData.age_range,
      email: userData.email,
      first_name: userData.first_name,
      gender: userData.gender,
      id: userData.id,
      last_name: userData.last_name,
      name: userData.name,
      picture: userData.picture
    };
    //check if any data is undefined, if so, don't update firebase
    for (var data in updateData){
      if (updateData[data] === undefined){
        delete updateData[data];
      }
    }
    userRef.update(updateData);
  };

  var setUser = function(userData){
    localStorage.setItem("userData", JSON.stringify(userData));
    user = userData;
    fireUpdateUser(userData);
  };
  var getUser = function(){
    return JSON.parse(localStorage.getItem("userData"));
  };

  var updateMovie = function(movieData){
    var movieRef = ref.child(user.id).child("movies").child(movieData.uid);
    var updateData = {
      uid: movieData.uid,
      seen: movieData.seen,
      rating: movieData.rating
    };
    for (var data in updateData){
      if (updateData[data] === undefined){
        delete updateData[data];
      }
    }
    movieRef.update(updateData);
  };

  return {
    setUser: setUser,
    getUser: getUser,
    updateMovie: updateMovie
  };
}])

.factory("Auth", ["$state", "$q", "$ionicLoading", "Fire", function($state, $q, $ionicLoading, Fire){
  var loginStatus = (function(){
    var set = function(newStatus){
      localStorage.setItem("loginStatus", newStatus);
    };
    var get = function(){
      return localStorage.getItem("loginStatus");
    };
    return {
      set: set,
      get: get
    };
  })();

  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }
    var authResponse = response.authResponse;
    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      Fire.setUser(profileInfo);
      $ionicLoading.hide();
      loginStatus.set(true);
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

    facebookConnectPlugin.api('/me?fields=email,name,first_name,last_name,age_range,gender,picture&access_token=' + authResponse.accessToken, null,
      function (response) {
        info.resolve(response);
      },
      function (response) {
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  var facebookSignIn = function() {
    if (window.cordova.platformId == "browser") {
      facebookConnectPlugin.browserInit(1036634036356683);
      // version (second argument) is optional. It refers to the version of API you may want to use.
    }
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        //console.log('getLoginStatus', success.status);

        if(!Fire.getUser()){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            Fire.setUser(profileInfo);
            loginStatus.set(true);
            $state.go('tab.dash');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        } else{
          loginStatus.set(true);
          $state.go('tab.dash');
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        //console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile', 'user_friends'], fbLoginSuccess, fbLoginError);
      }
    });
  };

  var facebookSignOut = function(){
    $ionicLoading.show({
      template: 'Logging out...'
    });

    // Facebook logout
    facebookConnectPlugin.logout(function(){
      $ionicLoading.hide();
      loginStatus.set(false);
      $state.go('landing');
    },
    function(fail){
      console.dir(fail);
      $ionicLoading.hide();
      alert('logout failed', fail);
    });
  };

  var test = function(){
    console.log(Fire.getUser());
    console.dir(FBSession);
  };

  return {
    getLoginStatus: loginStatus.get,
    facebookSignIn: facebookSignIn,
    facebookSignOut: facebookSignOut,
    test: test
  };
}])

.factory("omdbService", function(){
  var pad = function(number, length) {
    var str = '' + number;
    while(str.length < length) {
      str = '0' + str;
    }
    return str;
  };

  return {
      genID: function(){
       return pad(Math.floor((Math.random() * 2155529) + 1), 7);
    }
  };

})

.factory("listService", function(){
  //when the list is selected in the list controller, the currentList will be updated
  //when movieController is loaded, it will load from the selected list.
  var currentList = top1000;
  var index = 0;

  return {
    currentList: currentList,
    index: index
  };
});
