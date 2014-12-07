app.directive('bbHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            title: '=title'
        },
        template: '<div class="bb-header"><h1>{{title}}</h1><div class="actions" ng-transclude></div></div>'
    };
});