app.directive('bbContent', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '<div class="bb-content" ng-transclude></div>'
    };
});