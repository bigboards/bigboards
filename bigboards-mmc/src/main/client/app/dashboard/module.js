var dashboardModule = angular.module('bb.dashboard', ['ngResource']);

dashboardModule.controller('DashboardController', ['$scope', 'Nodes', 'Stacks', 'Tasks', 'socket', 'ApiFeedback', '$location',
                                          function ($scope,   Nodes,   Stacks,   Tasks,   socket,   ApiFeedback,   $location) {
    $scope.nodes = Nodes.list();

    $scope.model = {
        metrics: {}
    };

    socket.on('metrics', function(data) {
        $scope.model.metrics = data;
    });

    socket.on('task:started', function(task) {
        //if (! task) return;
        //
        //$scope.task = task;
        //$scope.url = '#/tasks/' + $scope.task.task.code + '/attempts/' + $scope.task.attempt + '/output';
    });

    socket.on('task:finished', function(task) {
        $scope.loadStacks();
    });

    socket.on('task:failed', function(task) {
        $scope.loadStacks();
    });

    $scope.loadStacks = function() {
        Stacks.list(function(stacks) {
            if (!stacks || stacks.length == 0) return;

            $scope.stack = stacks[0];
        });
    };

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

    $scope.uninstallStack = function(stack) {
        var confirmed = confirm("Are you sure? This will remove the current tint from the hex.");

        if (confirmed) {
            Stacks.uninstall(
                {id: stack.tint_id, owner: stack.owner.username},
                function(attempt) {
                    $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
                },
                ApiFeedback.onError()
            );
        }
    };


    // -- load the stack from the server
    $scope.loadStacks();
}]);
