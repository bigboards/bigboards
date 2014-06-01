shellModule.directive('tty', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@',
            helpRef: '@',
            bbClick: '='
        },
        controller: function ($scope) {
        },
        link: function ($scope, $element, $attributes) {
            // -- try to find the help element
            if ($scope.helpRef) {
                var hexElement = $($element.children("div.hex")[0]);

                if ($scope.bbClick)
                    hexElement.click($scope.bbClick);

                hexElement.hover(function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.show();
                },function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.hide();
                });
            }
        },
        templateUrl: 'views/shell/tty.html'
    };
});
