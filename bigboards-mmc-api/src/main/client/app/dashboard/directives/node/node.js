dashboardModule.directive('node', function() {
    return {
        restrict: 'E',
        scope: {
            node: '='
        },
        controller: function ($scope) {
        },
        templateUrl: 'app/dashboard/directives/node/node.html'
    };
});
