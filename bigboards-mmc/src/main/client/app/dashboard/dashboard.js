dashboardModule.controller('DashboardController', function ($scope, Nodes, Firmware, Tints, socket, ApiFeedback) {
    $scope.nodes = Nodes.query();
    $scope.tints = Tints.query();
    $scope.metrics = {};

    socket.on('metrics', function(data) {
        $scope.metrics = data;
    });

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


