dashboardModule.directive('hexDetail', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@'
        },
        controller: function ($scope, Nodes, socket) {
            $scope.nodes = Nodes.get();

            socket.on('nodes:attached', function(node) {
                $scope.nodes[node.name] = node;
            });
            socket.on('nodes:detached', function(node) {
                delete $scope.nodes[node.name];
            });
        },
        templateUrl: 'app/dashboard/directives/hex-detail/hex-detail.html'
    };
});
