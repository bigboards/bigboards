var libraryModule = angular.module('bb.library', ['ngResource', 'drFlip']);

libraryModule.controller('LibraryController', ['$scope', 'Library', 'Stacks', 'ApiFeedback', '$location', '$modal', function($scope,   Library,   Stacks,   ApiFeedback,   $location,   $modal) {
    $scope.library = {
        stacks: Library.find({type: 'stack'}),
        tutors: Library.find({type: 'tutor'})
    };

    //Stacks.list(function(stacks) {
    //    if (!stacks || stacks.length == 0) return;
    //
    //    $scope.installedStack = stacks[0];
    //});

    $scope.refresh = function() {
        Library.refresh();
        $scope.library.stacks = Library.find({type: 'stack'});
        $scope.library.tutors = Library.find({type: 'tutor'});
    };

    $scope.isStackInstalled = function(stack) {
        if (!$scope.installedStack) return false;
        else return ($scope.installedStack.tint_id == stack.tint_id);
    };

    $scope.addItem = function() {
        var modalInstance = $modal.open({
            templateUrl: 'app/library/addTint.html',
            controller: 'AddLibraryItemController',
            size: 'lg'
        });

        modalInstance.result.then(function (item) {
            $scope.library.stacks = Library.find({type: 'stack'});
            $scope.library.tutors = Library.find({type: 'tutor'});
        });
    };
}]);


libraryModule.controller('AddLibraryItemController', ['$scope', '$modalInstance', 'Library', 'ApiFeedback', function($scope, $modalInstance, Library, ApiFeedback) {
    $scope.model = {
        url: null
    };

    $scope.alerts = [];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.ok = function () {
        Library.persist($scope.model, function() {
            $modalInstance.close($scope.model);
        }, function(error) {
            $scope.alerts.push({type: 'danger', msg: 'Please validate the data you entered. We encountered the following error: ' + error.message})
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
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
                if (installed[idx]['owner']['username'] != $scope.tint.owner.username) continue;

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
                tint: {
                    type: $scope.tint.type,
                    owner: $scope.tint.owner.username,
                    slug: $scope.tint.slug,
                    uri: $scope.tint.uri
                }
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
                    owner: $scope.tint.owner.username,
                    slug: $scope.tint.slug
                },
                function(attempt) {
                    $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
                },
                ApiFeedback.onError()
            );
        }
    };

    $scope.remove =  function() {
        Library.remove(
            { type: $scope.tint.type, tintId: $scope.tint.slug, owner: $scope.tint.owner.username },
            function() {
                $location.path('/library');
            },
            ApiFeedback.onError()
        );
    };
}]);


libraryModule.service('Library', function(settings, $resource) {
    return $resource(
        settings.api + '/api/v1/library/:type/:owner/:tintId',
        {type: '@type', owner: '@owner', tintId: '@tintId'},
        {
            'find': { method: 'GET', isArray: false},
            'refresh': { method: 'POST', isArray: false},
            'persist': { method: 'PUT', isArray: false},
            'remove': { method: 'DELETE', isArray: false}
        }
    );
});
