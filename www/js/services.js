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
.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://luminous-torch-3475.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})

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
})

.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
});
