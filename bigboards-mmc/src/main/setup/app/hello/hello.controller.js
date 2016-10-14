angular.module('bb.setup')
    .controller('HelloViewController', HelloViewController);

HelloViewController.$Inject = ['$location'];

function HelloViewController($location) {
    var vm = this;

    vm.proceed = proceed;

    function proceed() {
        $location.path('/name')
    }

}
