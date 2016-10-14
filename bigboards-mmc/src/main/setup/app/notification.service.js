angular
    .module('bb.setup')
    .factory('Notifications', Notifications);

Notifications.$Inject = ['$mdToast'];

function Notifications($mdToast) {
    var service = {
        error: error
    };

    return service;

    function error(message) {
        var msg = message || "Something went wrong ... ";
        $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position("bottom left")
                .hideDelay(3000)
        );
    }
}