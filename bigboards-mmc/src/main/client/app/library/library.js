libraryModule.controller('LibraryController', function($scope, Library, Tints, socket) {
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

    $scope.installTint =  function(tintId) {
        Tints.save({tint: tintId});
    };

    $scope.$on('library:refresh', function(event, data) {
        $scope.library = Library.query();
    });
});

libraryModule.service('Library', function($resource) {
    return $resource('/api/v1/library/:tintId', {tintId: '@tintId'}, {
        'sync': { method: 'POST', isArray: true}
    });
});