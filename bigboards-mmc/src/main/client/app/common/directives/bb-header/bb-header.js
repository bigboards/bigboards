app.directive('bbHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: '<div><h2 class="col-12" ng-transclude></h2></div>'
    };
});