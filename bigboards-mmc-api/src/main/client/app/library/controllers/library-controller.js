app.controller('LibraryCtrl', ['$scope', '$stateParams', '$location', 'Library', 'Tints',
                   function(    $scope,   $stateParams,   $location,   Library,   Tints) {

    $scope.library = Library.query();

    $scope.refresh = function() {
        $scope.library = Library.sync();
    };

    $scope.installTint =  function(type, id) {
        Tints.install({type: type, id: encodeURIComponent(id)});
        $location.path('/tasks/tint_install/output');
    };

}]);

