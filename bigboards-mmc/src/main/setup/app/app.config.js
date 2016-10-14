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
        .when('/name', {
            templateUrl: 'app/name/view.html',
            controller: 'NameViewController',
            controllerAs: 'vm'
        })
        .when('/nodes', {
            templateUrl: 'app/nodes/view.html',
            controller: 'NodesViewController',
            controllerAs: 'vm'
        })
        .when('/user', {
            templateUrl: 'app/user/view.html',
            controller: 'UserViewController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        });
}