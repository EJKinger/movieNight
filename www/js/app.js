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

  .state('tab.friends', {
    url:'/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/tabs/friends.html',
        controller: 'FriendsCtrl'
      }
    }
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

  .state('tab.myList', {
    url: '/movies/myMovies/myList',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/myMovies/myList.html',
        controller: 'MyListCtrl'
      }
    }
  })

  .state('tab.movie', {
    url: '/movies/:id',
    views: {
      'tab-movies': {
        templateUrl: 'templates/tabs/movies/movie.html',
        controller: 'MovieCtrl'
        
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
