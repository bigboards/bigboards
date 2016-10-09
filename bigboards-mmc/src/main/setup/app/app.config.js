angular
    .module('bb.setup')
    .config(Configurator);

Configurator.$Inject = ['$routeProvider'];

function Configurator($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/hello/view.html',
            controller: 'HelloViewController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        });
}