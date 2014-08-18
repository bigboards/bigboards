dashboardModule.controller('DashboardController', function ($scope, Nodes, Firmware, Tints, socket, ApiFeedback) {
    $scope.nodes = Nodes.get();
    $scope.tints = Tints.query();

//    if ($scope.hex) {
//        $scope.tints = Tints.get();
//    } else {
//        $scope.$on('identified', function () {
//            $scope.tints = Tints.get();
//        });
//    }

    $scope.hasInstalledTints = function() {
        return this.tints.length > 0;
    };

    $scope.update = function() {
        Firmware.save(
            ApiFeedback.onSuccess("Successfully updated the hex to the latest version"),
            ApiFeedback.onError()
        );
    };

    $scope.tintInstalled = function() {
        return ($scope.tint && $scope.tint.id);
    };

    $scope.removeTint = function() {
        var confirmed = confirm("Are you sure? This will remove the current tint from the hex.");

        if (confirmed) {
            Tints.remove(
                {tintId: $scope.hex.tint},
                ApiFeedback.onSuccess("Successfully removed the current tint from the hex"),
                ApiFeedback.onError()
            );
        }
    };
});


