tasksModule.controller('TaskListController', function($scope, Tasks, socket) {
    $scope.tasks = Tasks.get();

    $scope.task = Tasks.get({id: 'current'});

    socket.on('task:started', function(task) {
        $scope.task = task;
    });

    socket.on('task:finished', function(task) {
        $scope.task = null;
    });

    socket.on('task:failed', function(task) {
        $scope.task = null;
    });
});

tasksModule.controller('TaskDetailController', function($scope, Tasks, socket, $routeParams) {
    $scope.task = Tasks.get({id: $routeParams.id});
});