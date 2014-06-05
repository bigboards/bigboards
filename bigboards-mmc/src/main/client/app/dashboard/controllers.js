dashboardModule.controller('DashboardController', function ($scope, Slots, Firmware, Tints, socket) {
    Slots.get(function(data) {
        $scope.slots = data;
    });

    $scope.tint = Tints.get({tintId: $scope.hex.tint});

    socket.on('send:metrics', function(data) {
        $scope.data = data.metrics[0];
        $scope.slots = data.slots;
    });

    $scope.currentNode = null;

    $scope.update = function() {
        Firmware.save();
    };
});


