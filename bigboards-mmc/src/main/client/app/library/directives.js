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
        templateUrl: 'app/library/partials/library-tint.html'
    };
});
