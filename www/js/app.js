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
    url: '/landing',
    templateUrl: 'templates/landing.html',
    controller: 'AccountCtrl'
  })

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    onEnter: ['Auth', '$state', function (Auth, $state){
      if (!Auth.getLoginStatus()){
        $state.go('landing');
      }
    }]
  })

  .state('tab.movies', {
    url: '/movies',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies.html',
        controller: 'MoviesCtrl'
      }
    }
  })

  .state('tab.lists', {
    url: '/movies/lists',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/lists.html',
        controller: 'ListsCtrl'
      }
    }
  })

  .state('tab.list', {
    url: '/movies/lists/:listId',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/lists/top1000.html',
        controller: 'ListCtrl'
      }
    }
  })

  .state('tab.myMovies', {
    url: '/movies/myMovies',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/myMovies.html',
        controller: 'MyMoviesCtrl'
      }
    }
  })

  .state('tab.rated', {
    url: '/movies/myMovies/rated',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/rated.html',
        controller: 'RatedCtrl'
      }
    }
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tabs/dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tabs/account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/landing');

});
