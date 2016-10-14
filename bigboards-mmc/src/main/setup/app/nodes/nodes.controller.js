angular.module('bb.setup')
    .controller('NodesViewController', NodesViewController);

NodesViewController.$Inject = ['$location', 'Application', 'Notifications'];

function NodesViewController($location, Application, Notifications) {
    var vm = this;

    vm.nodes = Application.listNodes();

    vm.proceed = proceed;
    vm.addNode = addNode;
    vm.removeNode = removeNode;

    function proceed() {
        if (vm.nodes.length == 0) {
            Notifications.error("At least one node is required.");
            return;
        }

        $location.path('/user');
    }

    function addNode(name) {
        if (vm.nodes.indexOf(name) != -1) {
            Notifications.error("There already is a node with that name.");
            return;
        }

        Application.addNode(name);
    }

    function removeNode(name) {
        Application.removeNode(name);
    }

}
