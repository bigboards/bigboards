libraryModule.directive('libraryTint', function() {
    return {
        restrict: 'E',
        scope: {
            tint: '=',
            bbClick: '=',
            'removeTint': '&onRemove',
            'installTint': '&onInstall'
        },
        controller: function ($scope) {
        },
        link: function ($scope, $element, $attributes) {},
        templateUrl: 'views/library/library-tint.html'
    };
});
