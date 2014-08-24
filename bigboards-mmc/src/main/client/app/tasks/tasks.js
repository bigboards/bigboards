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

tasksModule.controller('TaskOutputController', function($scope, Tasks, socket, $routeParams) {
    socket.on('task:started', function(task) {
        $scope.task = task;
        $scope.output = '';
        $scope.message = "I'm " + task.description;

        $scope.state = 'running';
    });

    socket.on('task:finished', function(task) {
        $scope.state = 'finished';
        $scope.message = "Hooray!";
    });

    socket.on('task:failed', function(task) {
        $scope.state = 'failed';
        $scope.message = "Whoops!";
    });

    socket.on('task:busy', function(progress) {
        $scope.output += progress.data;
    });
});