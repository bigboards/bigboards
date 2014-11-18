app.directive('bbHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@title'
        },
        template: '<div class="row"><h2 class="col-lg-8 col-md-8 col-sm-8">{{title}}</h2><div class="col-lg-4 col-md-4 col-sm-4" ng-transclude></div></div>'
    };
});