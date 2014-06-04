dashboardModule.controller('DashboardController', function ($scope, Slots, Firmware, socket) {
    Slots.get(function(data) {
        $scope.slots = data;
    });

    socket.on('send:metrics', function(data) {
        $scope.data = data.metrics[0];
        $scope.slots = data.slots;
    });

    $scope.currentNode = null;

    $scope.update = function() {
        Firmware.save();
    };
});


