app.directive('bbHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            title: '=title'
        },
        controller: function ($scope, socket, TaskManager) {
            $scope.url = "#/tasks";

            $scope.task = TaskManager.currentAttempt();

            socket.on('task:started', function(task) {
                $scope.task = task;
                $scope.url = '#/tasks/' + $scope.task.task.code + '/attempts/' + $scope.task.attempt + '/output';
            });

            socket.on('task:finished', function(task) {
                $scope.task = null;
            });

            socket.on('task:failed', function(task) {
                $scope.task = null;
            });
        },
        templateUrl: 'app/common/directives/bb-header/bb-header.html'
    };
});