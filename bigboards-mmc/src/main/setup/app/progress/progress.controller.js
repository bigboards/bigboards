angular.module('bb.setup')
    .controller('ProgressViewController', ProgressViewController);

ProgressViewController.$Inject = ['$location', 'Setup', 'Socket', 'Application', 'Notifications'];

function ProgressViewController($location, Setup, Socket, Application, Notifications) {
    var vm = this;

    vm.busy = false;
    vm.done = false;
    vm.error = null;

    vm.start = start;

    Socket.on("setup.busy", handleSetupBusy);
    Socket.on("setup.done", handleSetupDone);
    Socket.on("setup.fail", handleSetupFailed);

    function start() {
        vm.busy = true;

        Setup.process()
            .then(function() {
                Notifications.info("Processing ...")
            }, function(err) {
                vm.busy = false;
                vm.error = err.data.error;
            });
    }

    function handleSetupDone() {
        vm.busy = false;
        vm.done = true;
    }

    function handleSetupBusy(data) {

    }

    function handleSetupFailed(error) {
        vm.busy = false;
        vm.done = true;
        vm.error = error;
    }

}
