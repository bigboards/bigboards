updateModule.controller('UpdateController', function($scope, Library, Firmware, Patches, socket) {
    $scope.patches = Patches.get();
});