libraryModule.controller('LibraryController', function($scope, Library, Tints, socket, $location) {
    $scope.state = null;

    $scope.library = Library.query();

    $scope.actions = [
        {
            iconClass: 'fa-exchange',
            execute: function() {
                Library.sync();
            }
        }
    ];

    $scope.refresh = function() {
        $scope.library = Library.sync();
    };

    $scope.installTint =  function(type, id) {
        Tints.install({type: type, id: encodeURIComponent(id)});
        $location.path('/tasks/tint_install/output');
    };
});

libraryModule.service('Library', function($resource) {
    return $resource('/api/v1/library/:tintId', {tintId: '@tintId'}, {
        'sync': { method: 'POST', isArray: true}
    });
});