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
            controllerAs: 'vm',
            resolve: {
                clusterName: ['$routeParams', function($routeParams) {
                    return (! $routeParams.hasOwnProperty('clustername')) ? "": $routeParams.clustername;
                }]
            }
        })
        .when('/nodes', {
            templateUrl: 'app/nodes/view.html',
            controller: 'NodesViewController',
            controllerAs: 'vm',
            resolve: {
                clusterName: ['$location', '$routeParams', function($location, $routeParams) {
                    if (! $routeParams.hasOwnProperty('clustername')) $location.path("/name");
                    else return $routeParams.clustername;
                }],
                nodes: ['$location', '$routeParams', function($location, $routeParams) {
                    return (! $routeParams.hasOwnProperty('shortid')) ? []: $routeParams.nodes.split(',');
                }],
                shortId: ['$routeParams', function($routeParams) {
                    return (! $routeParams.hasOwnProperty('shortid')) ? "": $routeParams.shortid;
                }]
            }
        })
        .when('/user', {
            templateUrl: 'app/user/view.html',
            controller: 'UserViewController',
            controllerAs: 'vm',
            resolve: {
                clusterName: ['$location', '$routeParams', function($location, $routeParams) {
                    if (! $routeParams.hasOwnProperty('clustername')) $location.path("/name");
                    else return $routeParams.clustername;
                }],
                nodes: ['$location', '$routeParams', function($location, $routeParams) {
                    if (! $routeParams.hasOwnProperty('nodes')) $location.path("/name");
                    else return $routeParams.nodes.split(',');
                }],
                shortId: ['$routeParams', function($routeParams) {
                    return (! $routeParams.hasOwnProperty('shortid')) ? "": $routeParams.shortid;
                }]
            }
        })
        .when('/progress', {
            templateUrl: 'app/progress/view.html',
            controller: 'ProgressViewController',
            controllerAs: 'vm',
            clusterName: ['$location', '$routeParams', function($location, $routeParams) {
                if (! $routeParams.hasOwnProperty('clustername')) $location.path("/name");
                else return $routeParams.clustername;
            }],
            nodes: ['$location', '$routeParams', function($location, $routeParams) {
                if (! $routeParams.hasOwnProperty('nodes')) $location.path("/name");
                else return $routeParams.nodes.split(',');
            }],
            shortId: ['$location', '$routeParams', function($location, $routeParams) {
                if (! $routeParams.hasOwnProperty('shortid')) $location.path("/name");
                else return $routeParams.shortid;
            }]
        })
        .otherwise({
            redirectTo: '/'
        });
}