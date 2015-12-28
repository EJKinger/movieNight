angular.module('movieNight', ['ionic', 'firebase', 'movieNight.controllers', 'movieNight.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  //currently displays, empty title div covers it.
  //should completely cover screen (no nav bar, yes title bar)
  .state('landing', {
    url: "/landing",
    templateUrl: "templates/landing.html",
    controller: 'AccountCtrl',
    onEnter: ['Auth', '$location', function (Auth, $location){
      // Auth.$onAuth(function(authData) {
      //   if (Auth.authData === null) {
      //     console.log("Not logged in yet");
      //   } else {
      //     Auth.authData = authData; // This will display the user's name in our view
      //     console.log(authData);
      //     $location.path('/tab/dash');
      //   }
      // });
    }]
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    data: {
      requiresLogin: true
    }
  })

  // Each tab has its own nav history stack:
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
