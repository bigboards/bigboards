var app = angular.module( 'mmc', [
    'ngRoute',
    'bb.dashboard',
    'bb.tints',
    'bb.library',
    'bb.shell',

    'btford.socket-io'
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/partials/hexboard.html',
            controller: 'DashboardController'
        })
        .when('/tints', {
            title: 'Tint',
            templateUrl: 'views/tint/detail.html',
            controller: 'TintDetailController'
        })
        .when('/tints/actions/:actionId', {
            title: 'Tint',
            templateUrl: 'views/tint/action-detail.html',
            controller: 'TintActionDetailController'
        })
        .when('/tints/views', {
            title: 'Tint',
            templateUrl: 'views/tint/view-selector.html',
            controller: 'TintViewSelectorController'
        })
        .when('/tints/views/:viewId', {
            title: 'Tint',
            templateUrl: 'views/tint/view.html',
            controller: 'TintViewController'
        })
        .when('/tints/configuration', {
            title: 'Tint',
            templateUrl: 'views/tint/config.html',
            controller: 'TintConfigurationController'
        })
        .when('/library', {
            title: 'Library',
            templateUrl: 'views/library/library.html',
            controller: 'LibraryController'
        })

        .when('/shell', {
            title: 'Shell',
            templateUrl: 'views/shell/shell.html',
            controller: 'ShellController'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);

app.run(['$location', '$rootScope', 'socket', function($location, $rootScope, socket) {
    socket.emit('hex:identify', null, function(data) {
        $rootScope.hex = data;

        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            if (current.$$route) {
                $rootScope.title = current.$$route.title;
            }
        });
    });
}]);