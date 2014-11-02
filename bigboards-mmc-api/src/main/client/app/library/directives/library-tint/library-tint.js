libraryModule.directive('libraryTint', function() {
    return {
        restrict: 'E',
        scope: {
            tint: '=',
            bbClick: '=',
            'installTint': '&onInstall'
        },
        templateUrl: 'app/library/directives/library-tint/library-tint.html'
    };
});
