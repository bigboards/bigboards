libraryModule.controller('LibraryController', function($scope, Library, Tints, socket) {
    $scope.state = null;

    $scope.library = Library.get();

    $scope.actions = [
        {
            iconClass: 'fa-plus',
            execute: function() {
                $scope.$broadcast('sidebar:show', {
                    view: 'app/library/views/add.html',
                    controller: libraryModule.controller,
                    model: {}
                });
            }
        }
    ];

    $scope.$on('library:refresh', function(event, data) {
        $scope.library = Library.get();
    });

    $scope.removeTint = function(tintId) {
        Library.remove({tintId: tintId});
        delete $scope.library[tintId];
    };

    $scope.installTint =  function(tintId) {
        Tints.save({tintId: tintId});
    }
});

libraryModule.controller('LibraryAddController', ['$scope', 'Library', function($scope, Library) {
    $scope.model = {
        tintUri: null
    };

    $scope.add = function() {
        Library.save({tintUri: $scope.model.tintUri}, function() {
            $scope.model.tintUri = null;
            $scope.$emit('sidebar:hide');
            $scope.$emit('library:refresh');
        });
    };

    $scope.cancel = function() {
        $scope.model.tintUri = null;
        $scope.$broadcast('sidebar:hide');
    };
}]);
