updateModule.controller('UpdateController', function($scope, $location, Firmware, Patches, ApiFeedback) {
    $scope.patches = Patches.query();

    $scope.installPatch = function(name) {
        Patches.install({patch: name},
            function() {
                // navigate to tasks/install_patch/output
                $location = "/#/tasks/install_patch/output";
            },
            ApiFeedback.onError()
        );
    }

    $scope.update = function() {
        Firmware.install(
            function() {
                // navigate to tasks/update/output
                $location = "/#/tasks/update/output";
            },
            ApiFeedback.onError()
        )
    }
});