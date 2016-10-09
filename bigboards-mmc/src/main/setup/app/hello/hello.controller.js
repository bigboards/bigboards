angular.module('bb.setup')
    .controller('HelloViewController', HelloViewController);

HelloViewController.$Inject = [];

function HelloViewController() {
    var vm = this;

    vm.proceed = proceed;

    function proceed() {

    }

}
