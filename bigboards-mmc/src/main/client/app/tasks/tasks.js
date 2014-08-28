tasksModule.controller('TaskListController', function($scope, Tasks, socket) {
    $scope.tasks = Tasks.get();

    $scope.current = Tasks.get({id: 'current'});

    $scope.hasCurrentTask = function() {
        return ($scope.current && $scope.current.description);
    };

    socket.on('task:started', function(task) {
        $scope.current = task;
    });

    socket.on('task:finished', function(task) {
        $scope.current = null;
    });

    socket.on('task:failed', function(task) {
        $scope.current = null;
    });
});

tasksModule.controller('TaskDetailController', function($scope, Tasks, socket, $routeParams) {
    $scope.task = Tasks.get({id: $routeParams.id});
});

tasksModule.controller('TaskInvocationController', function($scope, Tasks, socket, $routeParams, $location) {
    $scope.task = Tasks.get({id: $routeParams.id});
    $scope.invokeParams = {};

    $scope.invokeTask = function() {
        Tasks.invoke(
            {'id': $routeParams.id},
            $scope.invokeParams,
            function(value, responseHeaders) {
                $location.path('/tasks/' + $routeParams + '/output');
            }
        );
    };
});

tasksModule.controller('TaskOutputController', function($scope, Tasks, socket, $routeParams) {
    $scope.output = '';

    socket.on('task:started', function(task) {
        $scope.task = task;
        $scope.state = 'running';

        $scope.output += 'We have started the following task:\n';
        $scope.output += '\tcode: ' + task.code + '\n';
        $scope.output += '\tdescription: ' + task.description + '\n';
        $scope.output += '--------------------------------------------------------------------------------\n';
        $scope.output += '\n\n';

    });

    socket.on('task:finished', function(task) {
        $scope.state = 'finished';

        $scope.output += '\n\n\n';
        $scope.output += '--------------------------------------------------------------------------------\n';
        $scope.output += 'Hooray!\n';
        $scope.output += 'We have successfully finished our task:\n';
        $scope.output += '\tcode: ' + task.code + '\n';
        $scope.output += '\tdescription: ' + task.description + '\n';
    });

    socket.on('task:failed', function(task) {
        $scope.state = 'failed';
        $scope.message = "Whoops!";

        $scope.output += '\n\n\n';
        $scope.output += '--------------------------------------------------------------------------------\n';
        $scope.output += 'Whoops!\n';
        $scope.output += 'We have FAILED to execute our task:\n';
        $scope.output += '\tcode: ' + task.code + '\n';
        $scope.output += '\tdescription: ' + task.description + '\n';
    });

    socket.on('task:busy', function(progress) {
        $scope.output += progress.data;
    });
});