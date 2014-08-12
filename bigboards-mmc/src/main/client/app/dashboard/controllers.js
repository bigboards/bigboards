dashboardModule.controller('DashboardController', function ($scope, Nodes, Firmware, Tints, socket, ApiFeedback) {
    Nodes.get(function(data) {
        $scope.nodes = data;
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

    socket.on('nodes:attached', function(node) {
        $scope.nodes[node.name] = node;
    });
    socket.on('nodes:detached', function(node) {
        delete $scope.nodes[node.name];
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

    $scope.metrics = {
        load: [43, 3, 78, 76, 74],
        temperature: [47, 47, 48, 49, 48],
        memory: [52, 52, 52, 63, 63],
        disk: [3, 3, 3, 3, 3]
    };
});


