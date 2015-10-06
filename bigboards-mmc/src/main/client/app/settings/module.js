app.controller('SettingsController', ['$scope', 'Hex', function($scope, Hex) {
    $scope.link = function(token) {
        Hex.link(token).then(function(response) {
            console.log(response);
        }, function(error) {
            console.log(error);
        });
    }
}]);