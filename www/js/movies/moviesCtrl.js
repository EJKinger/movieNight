

angular.controller('MoviesCtrl', function($scope, TDCardDelegate) {
  console.log('CARDS CTRL');
  var cardTypes = [
    { image: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png' },
    { image: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png' },
    { image: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png' },
  ];

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
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.addCard();
  };
});