angular.module('movieNight', ['ionic', 'firebase', 'movieNight.controllers', 'movieNight.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('landing', {
    url: "/landing",
    templateUrl: "templates/landing.html",
    controller: 'AccountCtrl',

    //ionic-web only
    onEnter: ['Auth', '$location', function (Auth, $location){
      Auth.$onAuth(function(authData) {
        if (authData){
          var id = authData.facebook.id;
          var ref = new Firebase("https://luminous-torch-3475.firebaseio.com");
          ref.child('users').set({id: authData.facebook.id});
          Auth.authData = authData;
          $location.path('/tab/dash');
        }
      });
    }]
    //end ionic-web only

  })

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    onEnter: ['Auth', '$location', function (Auth, $location){
      Auth.$onAuth(function(authData) {
        if (!authData){
          $location.path('/landing');
        }
      });
    }]
  })

  .state('tab.movies', {
    url: '/movies',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tab-movies.html',
        controller: 'MoviesCtrl'
      }
    }
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/landing');

});
