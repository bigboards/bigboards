libraryModule.directive('libraryTint', function() {
    return {
        restrict: 'E',
        scope: {
            tint: '=',
            bbClick: '=',
            'installTint': '&onInstall'
        },
        controller: function ($scope) {

        },
        link: function ($scope, $element, $attributes) {},
        templateUrl: 'app/library/directives/library-tint/library-tint.html'
    };
});
