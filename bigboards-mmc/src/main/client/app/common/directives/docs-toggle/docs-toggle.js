app.directive('docsToggle', function() {
    return {
        restrict: 'E',
        scope: {
            docsElement: '@docsElementId',
            contentElement: '@contentElementId'
        },
        controller: function ($scope, $route) {
            $scope.visible = false;

            $scope.toggle = function() {
                if ($scope.visible) $scope.$emit('docs:hide');
                else $scope.$emit('docs:show');

                $route.reload();
            };

            $scope.$on('docs:show', function() { $scope.visible = true; });
            $scope.$on('docs:hide', function() { $scope.visible = false; });
        },
        link: function ($scope, $element, $attributes) {
            $scope.$watch('visible', function() {
                if (!$scope.visible) {
                    $('#' + $scope.docsElement).hide();
                    $('#wrap').removeClass('splitview');
                } else {
                    $('#' + $scope.docsElement).show();
                    $('#wrap').addClass('splitview');
                }
            });

        },
        templateUrl: 'app/common/directives/docs-toggle/docs-toggle.html'
    };
});