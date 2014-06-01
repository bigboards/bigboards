dashboardModule.directive('hexNode', function() {
    return {
        restrict: 'E',
        scope: {
            type: '@',
            helpRef: '@',
            bbClick: '='
        },
        controller: function ($scope) {
            $scope.collapsed = true;

            $scope.toggleDetail = function() {
                $scope.collapsed = !$scope.collapsed;
            };

            $scope.contentClass = function() {
                return ($scope.collapsed) ? 'collapsed' : 'expanded';
            };
        },
        templateUrl: 'app/dashboard/partials/hex-node.html'
    };
});

dashboardModule.directive('hexNodeMetric', function() {
    return {
        restrict: 'E',
        scope: {
            data: '=model',
            unit: '@',
            label: '@'
        },
        controller: function ($scope) {
            $scope.data = {
                current: 60,
                max: 100,
                min: 0
            };
        },
        templateUrl: 'app/dashboard/partials/hex-node-metric.html'
    };
});
