app.controller('TintCtrl', ['$scope', '$stateParams', 'Tints', 'ApiFeedback',
                function(    $scope,   $stateParams,   Tints,   ApiFeedback) {

    $scope.tint = Tints.get({type: $stateParams.type, tintId: $stateParams.tintId});

    $scope.update = function() {
        Tints.update(
            {type: $scope.tint.type, id: encodeURIComponent($scope.tint.id)},
            ApiFeedback.onSuccess("Successfully updated the " + $scope.tint.name + " tint"),
            ApiFeedback.onError()
        );
    };

    $scope.removeTint = function() {
        var confirmed = confirm("Are you sure? This will remove the " + $scope.tint.name + " tint from the hex.");

        if (confirmed) {
            Tints.remove(
                {type: $scope.tint.type, id: encodeURIComponent($scope.tint.id)},
                ApiFeedback.onSuccess("Successfully removed the " + $scope.tint.name + " tint from the hex"),
                ApiFeedback.onError()
            );
        }
    };
}]);
