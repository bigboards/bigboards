app.controller('TintCtrl', ['$scope', '$stateParams', 'Stacks', 'ApiFeedback',
                function(    $scope,   $stateParams,   Stacks,   ApiFeedback) {
    $scope.playAsString = null;

    Stacks.get({owner: $stateParams.owner, tintId: $stateParams.tint}).$promise
        .then(function(stack) {
            $scope.stack = stack;
            $scope.playAsString = JSON.stringify(stack.play, null, 4);

            return stack;
        });



    //$scope.tint = Tints.get({type: $stateParams.type, tintId: $stateParams.tintId});
    //
    //$scope.update = function() {
    //    Tints.update(
    //        {type: $scope.tint.type, id: encodeURIComponent($scope.tint.id)},
    //        ApiFeedback.onSuccess("Successfully updated the " + $scope.tint.name + " tint"),
    //        ApiFeedback.onError()
    //    );
    //};
    //
    //$scope.removeTint = function() {
    //    var confirmed = confirm("Are you sure? This will remove the " + $scope.tint.name + " tint from the hex.");
    //
    //    if (confirmed) {
    //        Tints.remove(
    //            {type: $scope.tint.type, id: encodeURIComponent($scope.tint.id)},
    //            ApiFeedback.onSuccess("Successfully removed the " + $scope.tint.name + " tint from the hex"),
    //            ApiFeedback.onError()
    //        );
    //    }
    //};
}]);
