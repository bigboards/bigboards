angular.module('bb.setup')
    .controller('NameViewController', NameViewController);

NameViewController.$Inject = ['$location', 'Setup', 'Notifications', 'clusterName'];

function NameViewController($location, Setup, Notifications, clusterName) {
    var vm = this;

    vm.proceed = proceed;
    vm.name = clusterName;

    function proceed() {
        if (!vm.name || vm.name.length == 0) {
            Notifications.error("No cluster name");
            return;
        }

        var valid = /[a-z0-9_\-]+/.test(vm.name);

        if (! valid) {
            Notifications.error("Invalid cluster name");
            return;
        }

        Setup.validate.name(vm.name)
            .then(function(response) {
                if (response.exists === false) {
                    $location
                        .path('/nodes')
                        .search("clustername", vm.name);

                } else {
                    Notifications.error("That name is already taken!")
                }
            });
    }

}
