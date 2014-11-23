app.controller('DashboardCtrl', ['$scope', '$stateParams', '$location', 'Library', 'Hex',
                     function(    $scope,   $stateParams,   $location,   Library,   Hex) {

     $scope.getMetric = function(node, metric) {
         if (!$scope.hex.metrics) return 'na';
         if (!$scope.hex.metrics[node.name]) return 'na';
         if (!$scope.hex.metrics[node.name][metric]) return 'na';

         return $scope.hex.metrics[node.name][metric];
     };

}]);

