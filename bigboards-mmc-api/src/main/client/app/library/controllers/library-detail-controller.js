app.controller('LibraryCtrl', ['$scope', '$stateParams', '$location', 'Library', 'Tints',
                   function(    $scope,   $stateParams,   $location,   Library,   Tints) {

    $scope.item = Library.get({tintId: $stateParams.itemId});

}]);

