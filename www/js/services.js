angular.module('movieNight.services', ['firebase'])

.factory('Lists', [function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var lists = [{
    id: 'top1000',
    name: 'Top 1000',
    lastText: 'Rate the top 1000 movies of all time!',
    face: 'img/ben.png'
  }];

  return {
    all: function() {
      return lists;
    },
    remove: function(chat) {
      lists.splice(lists.indexOf(list), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (lists[i].id === parseInt(listId)) {
          return lists[i];
        }
      }
      return null;
    }
  };
}])

.factory('Auth', ['$state', '$q', '$ionicLoading','$window', function($state, $q, $ionicLoading, $window){

  var updateUser = function(userData){
    for (var item in userData){
      if (item === undefined){
        delete userData[item];
      }
    }
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  var checkUser = function(){
    return !!localStorage.getItem('userData');
  };

  var loginStatus = (function(){
    var set = function(newStatus){
      localStorage.setItem('loginStatus', newStatus);
    };
    var get = function(){
      return localStorage.getItem('loginStatus');
    };
    return {
      set: set,
      get: get
    };
  })();

  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError('Cannot find the authResponse');
      return;
    }
    var authResponse = response.authResponse;
    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      updateUser(profileInfo);
      $ionicLoading.hide();
      loginStatus.set(true);
      $state.go('tab.dash');
    }, function(fail){
      // Fail get profile info
      alert('Login Failed');
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
    if (window.cordova.platformId === 'browser') {
      facebookConnectPlugin.browserInit(1036634036356683);
      // version (second argument) is optional. It refers to the version of API you may want to use.
    }

    facebookConnectPlugin.getLoginStatus(function(success){

      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        //console.log('getLoginStatus', success.status);

        if(!checkUser()){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            updateUser(profileInfo);
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
    $state.go('landing');
    $ionicLoading.show({
      template: 'Logging out...'
    });

    // Facebook logout
    facebookConnectPlugin.logout(function(){
      $ionicLoading.hide();
      loginStatus.set(false);
      $window.location.reload(true)
    },
    function(fail){
      console.dir(fail);
      $ionicLoading.hide();
      alert('logout failed', fail);
      $window.location.reload(true)
    });
  };

  return {
    getLoginStatus: loginStatus.get,
    facebookSignIn: facebookSignIn,
    facebookSignOut: facebookSignOut,
    updateUser: updateUser
  };
}])

.factory('Fire', ['OMDB', 'Auth', '$q', function(OMDB, Auth, $q){
  var ref;
  var user;
  var userRef;
  var userMoviesRef;

  var fireUpdateUser = function(userData){
    //object with data to send to firebase
    var updateData = {
      age_range: userData.age_range,
      email: userData.email,
      first_name: userData.first_name,
      gender: userData.gender,
      id: userData.id,
      last_name: userData.last_name,
      name: userData.name,
      picture: userData.picture.data,
      friends: userData.friends
    };
    //check if any data is undefined, if so, don't update firebase
    for (var data in updateData){
      if (updateData[data] === undefined){
        delete updateData[data];
      }
    }
    userRef.update(updateData);
  };

  var getUser = function(){
    var userData = JSON.parse(localStorage.getItem('userData'));
    if (userData){
      return userData;
    } else $state.go('landing');
  };

  var updateMovie = function(movieData, type){
    var typeRef = userMoviesRef.child(type).child(movieData.uid);
    var updateData = {
      uid: movieData.uid,
      seen: movieData.seen,
      rating: movieData.rating,
      desire: movieData.desire
    };
    for (var data in updateData){
      if (updateData[data] === undefined){
        delete updateData[data];
      }
    }
    if (movieData && (type === 'notInterested' || type === 'watchList' || type === 'rated')){
      typeRef.update(updateData);
    }
  };

  var getMovies = function(childName){
    var movies = [];
    userMoviesRef.child(childName).on('child_added', function(snapshot) {
      var movie = {};
      angular.extend(movie, snapshot);
      OMDB.getMovie(snapshot.key()).then(function(data){
        movie.data = data;
        movies.push(movie);
      }, function(err){
        console.log(err);
      });
    });
    return movies;
  };

  var getProfileImageURL = function(id){
    return $q(function(resolve, reject){
      ref.child('users').child(id).child('picture').child('url').on('value', function(snapshot) {
        if (snapshot.val()){
          resolve(snapshot.val());
        } else reject();
      });
    });
  };

  var getFriends = function(){
    facebookConnectPlugin.api(getUser().id + '/friends', null,
    function (result) {
      var userData = getUser();
      userData.friends = result.data;
      for (var friend in userData.friends){
        getProfileImageURL(userData.friends[friend].id).then(function(url){
          userData.friends[friend].profileImageURL = url;
          Auth.updateUser(userData);
        }, function(err){
          console.log('Error in getFriends ', err);
        });
      }
    });
  };

  var sendMessage = function(chatId, uid, name, message){
    var chatRef = ref.child('chats').child(chatId);
    chatRef.push({name: name, uid: uid, message: message});
  };

  var getMessages = function(chatId, callback){
    var chatRef = ref.child('chats').child(chatId);
    chatRef.on('child_added', function(snapshot, prevChildKey) {
      callback(snapshot.val());
    });
  };

  (function init (){
    ref = new Firebase('https://luminous-torch-3475.firebaseio.com');
    userRef = ref.child('users').child(getUser().id);
    fireUpdateUser(getUser());
    getFriends();
    userMoviesRef = userRef.child('movies');
  })();

  return {
    getUser: getUser,
    updateMovie: updateMovie,
    getMovies: getMovies,
    getProfileImageURL: getProfileImageURL,
    sendMessage: sendMessage,
    getMessages: getMessages
  };
}])

.factory("OMDB", ['$q', '$http', function($q, $http){
  var getMovie = function(id){
    return $q(function(resolve, reject){
      $http({
        method: 'get',
        url: "http://www.omdbapi.com/?i=" + id + '&plot=full&r=json'
      }).then(function(res){
        res.data.PosterO = "http://img.omdbapi.com/?i=" + id + "&apikey=" + OMDB_API;
        resolve(res.data);
      }, function(err){
        console.log(err);
        reject(err);
      });
    });
  };

  var getMovieImage = function(id){

  };

  return {
    getMovie: getMovie,
    getMovieImage: getMovieImage
  };
}])

.factory('List', [function(){
  //when the list is selected in the list controller, the currentList will be updated
  //when movieController is loaded, it will load from the selected list.
  var myLists = [
    {title: 'Rated Movies', path: 'myList', child: 'rated'},
    {title: 'Watch List', path: 'myList', child: 'watchList'},
    {title: 'Not Interested', path: 'myList', child: 'notInterested'}
  ];
  var myCurrentList;
  var currentList = top1000;
  var index = 0;

  return {
    currentList: currentList,
    index: index,
    myLists: myLists,
    myCurrentList: myCurrentList
  };
}])

.factory('Movie', [function(){
  var current = (function(){
    var currentMovieData;
    return {
      get: function(){
        return currentMovieData;
      },
      set: function(movieData){
        currentMovieData = movieData;
      }
    };
  })();

  return {
    getCurrent: current.get,
    setCurrent: current.set
  };
}])

.factory('Friend', [function(){
  var current = (function(){
    var currentFriend;
    return {
      get: function(){
        return currentFriend;
      },
      set: function(friend){
        currentFriend = friend;
      }
    };
  })();

  return {
    getCurrent: current.get,
    setCurrent: current.set
  };

}]);
