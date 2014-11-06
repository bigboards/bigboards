app.controller('TaskCtrl', ['$scope', '$stateParams', 'Tasks',
                function(    $scope,   $stateParams,   Tasks) {

    $scope.node = null;

    Nodes.query(function(nodes) {
        nodes.forEach(function(node) {
            if (node.name == $stateParams.nodeName)
                $scope.node = node;
        });
    });

}]);

