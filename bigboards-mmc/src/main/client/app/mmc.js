var app = angular.module( 'mmc', [
    'ngRoute',
    'bb.dashboard',
    'bb.tints',
    'bb.library',
    'bb.shell',
    'bb.tasks',
    'bb.update',
    'snap',
    'nvd3ChartDirectives',
    'btford.socket-io'
]);

app.config(['$routeProvider', 'snapRemoteProvider', function($routeProvider, snapRemoteProvider) {
    snapRemoteProvider.globalOptions = {
        maxPosition: 200
    };

    $routeProvider
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/library', {
            title: 'Library',
            templateUrl: 'app/library/library.html',
            controller: 'LibraryController'
        })
        .when('/shell', {
            title: 'Shell',
            templateUrl: 'app/shell/shell.html',
            controller: 'ShellController'
        })

        .when('/tasks', {
            title: 'Tasks',
            templateUrl: 'app/tasks/tasks.html',
            controller: 'TaskListController'
        })
        .when('/tasks/:id/output', {
            title: 'Tasks',
            templateUrl: 'app/tasks/output.html',
            controller: 'TaskOutputController'
        })
        .when('/tasks/:id', {
            title: 'Tasks',
            templateUrl: 'app/tasks/detail.html',
            controller: 'TaskDetailController'
        })
        .when('/tasks/:id/invoke', {
            title: 'Tasks',
            templateUrl: 'app/tasks/invoke.html',
            controller: 'TaskInvocationController'
        })

        .when('/update', {
            title: 'Update',
            templateUrl: 'app/update/update.html',
            controller: 'UpdateController'
        })

        .when('/tints/:type/:id', {
            title: 'Tint',
            templateUrl: 'app/tints/detail.html',
            controller: 'TintDetailController'
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

app.controller('ApplicationController', function($scope, $location, Firmware) {
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
            label: 'Tasks',
            icon: 'fa-tasks',
            path: '/tasks'
        },
//        {
//            label: 'Shell',
//            icon: 'fa-terminal',
//            path: '/shell'
//        },
        {
            label: 'Update',
            icon: 'fa-refresh',
            path: '/update'
        },
        {
            label: 'Documentation',
            icon: 'fa-book',
            url: 'http://docs.bigboards.io/en/1.0.0/'
        }

    ];

    $scope.firmware = Firmware.get();

    $scope.$on('$routeChangeSuccess', function(event, current, previous) {
        $scope.menu.forEach(function(item) {
            if (item.path && current.$$route && item.path == current.$$route.originalPath)
                $scope.currentItem = item;
        });
    });

    $scope.invokeMenuItem = function(item) {
        if (item.handler) {
            item.handler($scope);
        } else if (item.path) {
            $location.path(item.path);
            $scope.$emit('navigate', item);
        } else if (item.url) {
            console.log('goto ' + item.url);
            window.open(item.url,'_blank');
        }
    };
});
