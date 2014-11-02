app.controller('NodeCtrl', ['$scope', '$stateParams', 'Nodes',
                function(    $scope,   $stateParams,   Nodes) {

    $scope.node = null;

    Nodes.query(function(nodes) {
        nodes.forEach(function(node) {
            if (node.name == $stateParams.nodeName)
                $scope.node = node;
        });
    });

}]);
