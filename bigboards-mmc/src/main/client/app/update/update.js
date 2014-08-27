updateModule.controller('UpdateController', function($scope, Patches) {
    $scope.patches = Patches.query();
});