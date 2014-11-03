app.controller('TintCtrl', ['$scope', '$stateParams', 'Tints',
                function(    $scope,   $stateParams,   Tints) {

    $scope.tint = Tints.get({type: $stateParams.type, tintId: $stateParams.tintId});

}]);
