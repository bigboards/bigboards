var app = angular.module( 'mmc', [
    'ngRoute',
    'bb.dashboard',
    'bb.tints',
    'bb.tints.stack',
    'bb.library',
    'bb.tasks',
    'bb.update',
    'nvd3ChartDirectives',
    'btford.socket-io',
    'ui.bootstrap'
]);

app.constant('settings', {
    api: ''
    //api: 'http://10.40.2.247:7000'
});

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            title: 'Dashboard',
            templateUrl: 'app/dashboard/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/stacks/:owner/:id', {
            title: 'Tint',
            templateUrl: 'app/stacks/detail.html',
            controller: 'StackDetailController'
        })

        .when('/tasks', {
            title: 'Tasks',
            templateUrl: 'app/tasks/tasks.html',
            controller: 'TaskListController'
        })
        .when('/tasks/:code', {
            title: 'Tasks',
            templateUrl: 'app/tasks/detail.html',
            controller: 'TaskDetailController'
        })
        .when('/tasks/:code/attempts/:attempt/:channel', {
            title: 'Tasks',
            templateUrl: 'app/tasks/attempt.html',
            controller: 'TaskAttemptController'
        })

        .when('/library', {
            title: 'Library',
            templateUrl: 'app/library/library.html',
            controller: 'LibraryController'
        })


        .otherwise({
            redirectTo: '/dashboard'
        });
}]);

app.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        if (current.$$route) {
            $rootScope.title = current.$$route.title;
        }
    });
}]);

app.controller('ApplicationController', ['$scope', '$location', 'Hex', 'socket', 'Firmware', function($scope, $location, Hex, socket, Firmware) {
    $scope.currentItem = null;
    $scope.hex = Hex.me();

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
//        {
//            label: 'Update',
//            icon: 'fa-refresh',
//            path: '/update'
//        },
        {
            label: 'Documentation',
            icon: 'fa-book',
            url: 'http://docs.bigboards.io'
        }

    ];

    //$scope.firmware = Firmware.get();

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
}]);
