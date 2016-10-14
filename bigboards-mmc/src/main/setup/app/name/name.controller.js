angular.module('bb.setup')
    .controller('NameViewController', NameViewController);

NameViewController.$Inject = ['$location', 'CloudClusters', 'Application', 'Notifications'];

function NameViewController($location, CloudClusters, Application, Notifications) {
    var vm = this;

    vm.proceed = proceed;

    function proceed(name) {
        if (!name || name.length == 0) {
            Notifications.error("No cluster name");
            return;
        }

        var valid = /[a-z0-9_\-]+/.test(name);

        if (! valid) {
            Notifications.error("Invalid cluster name");
            return;
        }

        CloudClusters.validate.name(name)
            .then(function(response) {
                if (response.exists === false) {
                    Application.setName(name);

                    $location.path('/nodes')
                } else {
                    Notifications.error("That name is already taken!")
                }
            });
    }

}
