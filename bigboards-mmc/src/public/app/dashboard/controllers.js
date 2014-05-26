dashboardModule.controller('DashboardController', function ($scope, HexMetrics, Metrics, Status, $interval, $location, socket) {
    socket.emit('slots:list', null, function(data) {
        $scope.slots = data;
    });

    socket.on('send:metrics', function(data) {
        $scope.data = data.metrics[0];
        $scope.slots = data.slots;
    });

    socket.on('send:hex', function(data) {
        $scope.hex = data;
    });

    $scope.currentNode = null;

    $scope.update = function() {
        socket.emit('hex:update', null);
    };

    $scope.levelStyle = function(current, max) {
        var percentage = current / max;

        var r = (255 * percentage)/100;
        var g = (255 * (100 - percentage))/100;

        return { color: 'rgb(' + r + ', ' + g + ', 0)' };
    };

    $scope.nodeClass = function(nodeName) {
        if ($scope.statusPromise &&
            $scope.statusPromise.hex.nodes.availability[nodeName])
            return "available";
        else
            return "unavailable";
    };

});


