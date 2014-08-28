updateModule.controller('UpdateController', function($scope, $location, Patches, ApiFeedback) {
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
});