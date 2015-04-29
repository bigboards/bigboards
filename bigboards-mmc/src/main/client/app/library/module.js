var libraryModule = angular.module('bb.library', ['ngResource']);

libraryModule.controller('LibraryController', ['$scope', 'Library', 'Stacks', 'ApiFeedback', '$location', '$modal', function($scope,   Library,   Stacks,   ApiFeedback,   $location,   $modal) {
    $scope.library = {
        stacks: Library.find({type: 'stack'}),
        tutorials: Library.find({type: 'tutorial'})
    };
}]);

libraryModule.controller('LibraryItemViewController', ['$scope', '$location', 'tint', 'Library', 'ApiFeedback', 'Tints', function($scope, $location, tint, Library, ApiFeedback, Tints) {
    $scope.tint = tint;
    $scope.isInstalled = null;
    $scope.tintDetails = 'app/library/partials/empty.html';

    $scope.tint.$promise.then(function() {
        $scope.tintDetails = 'app/library/partials/' + tint.type + '.html';

        Tints.list().$promise.then(function(installed) {
            for (var idx in installed) {
                if (installed[idx]['slug'] != $scope.tint.slug) continue;
                if (installed[idx]['owner'] != $scope.tint.owner) continue;

                $scope.isInstalled = true;
                return;
            }

            $scope.isInstalled = false;
        });
    });

    $scope.install = function() {
        Tints.install(
            {
                type: $scope.tint.type
            },
            {
                tint: $scope.tint
            },
            function(attempt) {
                $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
            },
            ApiFeedback.onError()
        );
    };

    $scope.uninstall = function() {
        var confirmed = confirm("Are you sure? This will remove the tint from the hex.");

        if (confirmed) {
            Tints.uninstall(
                {
                    type: $scope.tint.type,
                    owner: $scope.tint.owner,
                    slug: $scope.tint.slug
                },
                function(attempt) {
                    $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
                },
                ApiFeedback.onError()
            );
        }
    };
}]);


libraryModule.service('Library', function(settings, $resource) {
    return $resource(
        'http://hive.bigboards.io/api/v1/library/:type/:owner/:slug',
        {type: '@type', owner: '@owner', slug: '@slug'},
        {
            'find': { method: 'GET', isArray: false}
        }
    );
});
