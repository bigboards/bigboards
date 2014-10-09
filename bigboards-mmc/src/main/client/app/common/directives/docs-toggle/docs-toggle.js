app.directive('docsToggle', function() {
    return {
        restrict: 'E',
        scope: {
            docsElement: '@docsElementId',
            contentElement: '@contentElementId'
        },
        controller: function ($scope) {
            $scope.visible = false;

            $scope.toggle = function() {
                if ($scope.visible) $scope.$emit('docs:hide');
                else $scope.$emit('docs:show');
            };

            $scope.$on('docs:show', function() { $scope.visible = true; });
            $scope.$on('docs:hide', function() { $scope.visible = false; });
        },
        link: function ($scope, $element, $attributes) {
            $scope.$watch('visible', function() {
                if (!$scope.visible) {
                    $('#' + $scope.docsElement).hide();
                    $('#' + $scope.contentElement).css('width', '100%');
                } else {
                    $('#' + $scope.docsElement).show();
                    $('#' + $scope.contentElement).css('width', '50%');
                }
            });

        },
        templateUrl: 'app/common/directives/docs-toggle/docs-toggle.html'
    };
});