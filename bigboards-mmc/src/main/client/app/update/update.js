updateModule.controller('UpdateController', function($scope, Patches, ApiFeedback) {
    $scope.patches = Patches.query();

    $scope.installPatch = function(name) {
        Patches.install({patch: name},
        ApiFeedback.onSuccess("Succesfully submit patch '" + name + "' for installation!"),
        ApiFeedback.onError());
    }
});