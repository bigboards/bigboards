app.directive('menuItem', function() {
    return {
        restrict: 'E',
        scope: {
            label: '@label',
            icon: '@icon',
            path: '@path'
        },
        controller: function ($scope, $location) {
            $scope.click = function() {
                $location.path($scope.path);
                $scope.$emit('navigate', {
                    label: $scope.label,
                    icon: $scope.icon
                });
            };
        },
        link: function ($scope, $element, $attributes) {

        },
        templateUrl: 'app/common/directives/menu-item/menu-item.html'
    };
});