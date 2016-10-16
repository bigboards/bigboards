angular.module('bb.setup')
    .controller('NodesViewController', NodesViewController);

NodesViewController.$Inject = ['$location', 'Notifications', 'clusterName', 'nodes'];

function NodesViewController($location, Notifications, clusterName, nodes) {
    var vm = this;

    vm.clusterName = clusterName;
    vm.nodes = nodes;

    vm.proceed = proceed;
    vm.addNode = addNode;
    vm.removeNode = removeNode;

    function proceed() {
        if (vm.nodes.length == 0) {
            Notifications.error("At least one node is required.");
            return;
        }

        $location
            .path('/user')
            .search('clustername', clusterName)
            .search('nodes', vm.nodes.join(','));
    }

    function addNode(name) {
        if (vm.nodes.indexOf(name) != -1) {
            Notifications.error("There already is a node with that name.");
            return;
        }

        $location.search('nodes', vm.nodes.join(','));
    }

    function removeNode(name) {
        $location.search('nodes', vm.nodes.join(','));
    }

}
