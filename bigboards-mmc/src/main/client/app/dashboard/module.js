var dashboardModule = angular.module('bb.dashboard', ['ngResource']);

dashboardModule.controller('DashboardController', ['$scope', 'Hex', 'Nodes', 'Tints', 'Tasks', 'socket', 'ApiFeedback', '$location',
                                          function ($scope,   Hex,   Nodes,   Tints,   Tasks,   socket,   ApiFeedback,   $location) {
    $scope.nodes = Nodes.list();
    $scope.charts = {
        load: {},
        cpu: {},
        memory: {},
        network: {}
    };

    //Metrics.list({report: 'load'}).then(function(response) {
    //
    //});

    Hex.getInstalledTints().then(function(installedTints) {
        $scope.tints = installedTints;
    });

    Hex.getIdentity().then(function(identity) {
        $scope.deviceName = identity.name;
    });



  //  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  //$scope.series = ['Series A', 'Series B'];
  //$scope.data = [
  //    [65, 59, 80, 81, 56, 55, 40],
  //    [28, 48, 40, 19, 86, 27, 90]
  //];
  //$scope.onClick = function (points, evt) {
  //    console.log(points, evt);
  //};
  //$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  //$scope.options = {
  //    scales: {
  //        yAxes: [
  //            {
  //                id: 'y-axis-1',
  //                type: 'linear',
  //                display: true,
  //                position: 'left'
  //            },
  //            {
  //                id: 'y-axis-2',
  //                type: 'linear',
  //                display: true,
  //                position: 'right'
  //            }
  //        ]
  //    }
  //};

    socket.on('task:finished', function(task) {
        $scope.tints = Hex.getInstalledTints();
    });

    socket.on('task:failed', function(task) {
        $scope.tints = Hex.getInstalledTints();
    });

    $scope.hasInstalledTints = function() {
        return $scope.tints && Object.keys($scope.tints).length > 0;
    };

    $scope.update = function() {
        Firmware.save(
            ApiFeedback.onSuccess("Successfully updated the hex to the latest version"),
            ApiFeedback.onError()
        );
    };

    $scope.powerOff = function() {
        Hex.halt(function(attempt) {
                $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
            },
            ApiFeedback.onError()
        );
    };
}]);
