app.controller('SettingsController', ['$scope', 'Hex', function($scope, Hex) {
    $scope.hiveLinkPart = determineHiveLinkPart($scope.hexConfig);

    $scope.link = function(token) {
        Hex.link(token).then(function(response) {
            refresh();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.unlink = function() {
        Hex.unlink().then(function(response) {
            refresh();
        }, function(error) {
            console.log(error);
        });
    };

    function refresh() {
        Hex.get().then(function(hexConfiguration) {
            $scope.hexConfig = hexConfiguration.data;
            $scope.hiveLinkPart = determineHiveLinkPart($scope.hexConfig);
        });
    }

    function determineHiveLinkPart(hexConfig) {
        if (hexConfig && hexConfig['hive.token']) return 'app/settings/partials/linked.part.html';
        else return 'app/settings/partials/unlinked.part.html';
    }


    refresh();
}]);