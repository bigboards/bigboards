dashboardModule.controller('DashboardController', function ($scope, Nodes, Firmware, Tints, socket, ApiFeedback) {
    $scope.nodes = Nodes.query();
    $scope.tints = {
        stack: Tints.get({type: 'stack'}),
        data: Tints.query({type: 'data'}),
        edu: Tints.query({type: 'edu'})
    };

    $scope.model = {
        metrics: {}
    };

    socket.on('metrics', function(data) {
        $scope.model.metrics = data;
    });

    $scope.getMetric = function(node, metric) {
        if (! $scope.model.metrics) return 'na';
        if (! $scope.model.metrics[node.name]) return 'na';
        if (! $scope.model.metrics[node.name][metric]) return 'na';

        return $scope.model.metrics[node.name][metric];
    };

    $scope.hasInstalledTints = function() {
        return this.tints.length > 0;
    };

    $scope.update = function() {
        Firmware.save(
            ApiFeedback.onSuccess("Successfully updated the hex to the latest version"),
            ApiFeedback.onError()
        );
    };

    $scope.removeTint = function(tint) {
        var confirmed = confirm("Are you sure? This will remove the current tint from the hex.");

        if (confirmed) {
            Tints.remove(
                {id: tint.id, type: tint.type},
                ApiFeedback.onSuccess("Successfully removed the current tint from the hex"),
                ApiFeedback.onError()
            );
        }
    };
});


