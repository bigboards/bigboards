dashboardModule.controller('DashboardController', function ($scope, Slots, Firmware, Tints, socket, ApiFeedback) {
    Slots.get(function(data) {
        $scope.slots = data;
    });

    if ($scope.hex)
        $scope.tint = Tints.get({tintId: $scope.hex.tint});
    else
        $scope.$on('identified', function(event, data) {
            $scope.tint = Tints.get({tintId: $scope.hex.tint});
        });

    socket.on('send:metrics', function(data) {
        $scope.data = data.metrics[0];
        $scope.slots = data.slots;
    });

    $scope.currentNode = null;

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


