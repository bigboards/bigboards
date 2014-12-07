var dashboardModule = angular.module('bb.dashboard', ['ngResource']);

dashboardModule.controller('DashboardController', ['$scope', 'Nodes', 'Stacks', 'socket', 'ApiFeedback',
                                          function ($scope,   Nodes,   Stacks,   socket,   ApiFeedback) {
    $scope.nodes = Nodes.list();

    // -- load the stack from the server
    Stacks.list(function(stacks) {
        if (!stacks || stacks.length == 0) return;

        $scope.stack = stacks[0];
    });

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
}]);
