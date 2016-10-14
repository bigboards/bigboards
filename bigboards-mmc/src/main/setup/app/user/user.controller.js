angular.module('bb.setup')
    .controller('UserViewController', UserViewController);

UserViewController.$Inject = ['$location', 'CloudUsers', 'Application', 'Notifications'];

function UserViewController($location, CloudUsers, Application, Notifications) {
    var vm = this;

    vm.proceed = proceed;

    function proceed(shortId) {
        CloudUsers.validateShortId(shortId)
            .then(function(response) {
                if (response.exists === true) {
                    Application.setShortId(name);

                    $location.path('/start')
                } else {
                    Notifications.error("That short ID does not exist!")
                }
            });
    }

}
