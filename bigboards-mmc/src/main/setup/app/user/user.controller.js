angular.module('bb.setup')
    .controller('UserViewController', UserViewController);

UserViewController.$Inject = ['$location', 'Setup', 'Notifications', 'clusterName', 'nodes', 'shortId'];

function UserViewController($location, Setup, Notifications, clusterName, nodes, shortId) {
    var vm = this;

    vm.clusterName = clusterName;
    vm.nodes = nodes;
    vm.shortId = shortId;

    vm.proceed = proceed;

    function proceed() {
        Setup.validateShortId(vm.shortId)
            .then(function(response) {
                if (response.exists === true) {
                    $location.path('/progress')
                        .search('clustername', vm.clusterName)
                        .search('nodes', vm.nodes)
                        .search('shortid', vm.shortId);
                } else {
                    Notifications.error("That short ID does not exist!")
                }
            });
    }

}
