app.controller('SetupController', function($rootScope, $scope, $location, Hex, socket) {
    $scope.currentView = 'welcome';

    $scope.next = function() {
        if ($scope.currentView == 'welcome') {
            $scope.currentView = 'bootstrap';
            moveToNextHex();

        } else if ($scope.currentView == 'bootstrap') {
            $scope.currentView = 'bootstrapping';
            moveToNextHex();

            $scope.busy = true;

            socket.emit('hex:bootstrap', null, function(err, data) {
                if (err) return $scope.error = err;

                try {
                    $scope.currentView = 'done';

                    return moveToNextHex();
                } finally {
                    $scope.busy = false;
                }
            });

        } else if ($scope.currentView == 'done') {
            socket.emit('hex:identify', null, function(data) {
                $rootScope.hex = data;

                $location.path("/");
            });
        }
    };

    $scope.activeClass = function(viewName) {
        if (viewName == $scope.currentView) return "active";
        else return "";
    };

    function moveToNextHex() {
        // -- move the setup view
        $('.setup').animate({
            'marginLeft' : "-=400px"
        });
    }
});
