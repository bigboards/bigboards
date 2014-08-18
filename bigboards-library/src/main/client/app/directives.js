app.directive('tint',  function() {
    return {
        restrict: 'E',
        scope: {
            tint: '='
        },
        controller: function($scope) {
        },
        link: function(scope, element, attr) {
        },
        templateUrl : 'app/directives/tint.html'
    }
});