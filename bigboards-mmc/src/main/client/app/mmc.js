var app = angular.module( 'mmc', [
    'ngRoute',
    'ngAnimate',
    'bb.dashboard',
    'bb.tints',
    'bb.library',
    'bb.shell',
    'snap',

    'btford.socket-io'
]);

app.config(['$routeProvider', 'snapRemoteProvider', function($routeProvider, snapRemoteProvider) {
    snapRemoteProvider.globalOptions = {
        maxPosition: 200
    };

    $routeProvider
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/partials/dashboard.html',
            controller: 'DashboardController'
        })


        .when('/tints', {
            title: 'Tint',
            templateUrl: 'app/tint/partials/detail.html',
            controller: 'TintDetailController'
        })
        .when('/tints/actions/:actionId', {
            title: 'Tint',
            templateUrl: 'app/tint/partials/action-detail.html',
            controller: 'TintActionDetailController'
        })
        .when('/tints/views', {
            title: 'Tint',
            templateUrl: 'app/tint/partials/view-selector.html',
            controller: 'TintViewSelectorController'
        })
        .when('/tints/views/:viewId', {
            title: 'Tint',
            templateUrl: 'app/tint/partials/view.html',
            controller: 'TintViewController'
        })
        .when('/tints/configuration', {
            title: 'Tint',
            templateUrl: 'app/tint/partials/config.html',
            controller: 'TintConfigurationController'
        })


        .when('/library', {
            title: 'Library',
            templateUrl: 'app/library/partials/library.html',
            controller: 'LibraryController'
        })

        .when('/shell', {
            title: 'Shell',
            templateUrl: 'app/shell/partials/shell.html',
            controller: 'ShellController'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);

app.run(['$rootScope', 'Identity', function($rootScope, Identity) {
    Identity.get(function(data) {
        $rootScope.hex = data;
        $rootScope.$broadcast('identified', data);
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
        }
    });
}]);

app.controller('ApplicationController', function($scope, $location) {
    $scope.currentItem = null;

    $scope.menu = [
        {
            label: 'Dashboard',
            icon: 'fa-dashboard',
            path: '/dashboard'
        },
        {
            label: 'Library',
            icon: 'fa-tint',
            path: '/library'
        },
        {
            label: 'Shell',
            icon: 'fa-terminal',
            path: '/shell'
        },
        {
            label: 'Update',
            icon: 'fa-refresh',
            path: '/update'
        }

    ];

    $scope.$on('$routeChangeSuccess', function(event, current, previous) {
        $scope.menu.forEach(function(item) {
            if (item.path && current.$$route && item.path == current.$$route.originalPath)
                $scope.currentItem = item;
        });
    });

    $scope.invokeMenuItem = function(item) {
        if (!$scope.currentItem || item.label != $scope.currentItem.label) {
            if (item.handler) {
                item.handler($scope);
            } else if (item.path) {
                $location.path(item.path);
                $scope.$emit('navigate', item);
            }
        }
    };
});