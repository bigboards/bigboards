var libraryModule = angular.module('bb.library', ['ngResource', 'drFlip']);

libraryModule.controller('LibraryController', ['$scope', 'Library', 'Stacks', 'ApiFeedback', '$location', '$modal',
                                       function($scope,   Library,   Stacks,   ApiFeedback,   $location,   $modal) {
    $scope.library = {
        stacks: Library.find({type: 'stack'})
    };

    $scope.refresh = function() {
        Library.refresh();
        $scope.library.stacks = Library.find({type: 'stack'});
    };

    $scope.addStack = function() {
        var modalInstance = $modal.open({
            templateUrl: 'app/library/addTint.html',
            controller: 'AddLibraryItemController',
            size: 'lg'
        });

        modalInstance.result.then(function (item) {
            $scope.library.stacks = Library.find({type: 'stack'});
        });
    };

    $scope.installStack =  function(stack) {
        Stacks.install(
            { },
            { "tint": {
                "owner": stack.owner.username,
                "type": "stack",
                "id": stack['tint_id'],
                "uri": 'https://bitbucket.org/' + stack.owner.username + '/' + stack['tint_id'] + '.git'
            } },
            function(attempt) {
                $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
            },
            ApiFeedback.onError()
        );
    };

    $scope.removeStack =  function(owner, id) {
        Library.remove(
            { type: 'stack', tintId: id, owner: owner },
            function(attempt) {
                $scope.library.stacks = Library.find({type: 'stack'});
            },
            ApiFeedback.onError()
        );
    };
}]);


libraryModule.controller('AddLibraryItemController', ['$scope', '$modalInstance', 'Library', 'ApiFeedback', function($scope, $modalInstance, Library, ApiFeedback) {
    $scope.model = {
        type: 'stack',
        owner: null,
        tintId: null
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


libraryModule.service('Library', function($resource) {
    return $resource(
        '/api/v1/library/:type/:owner/:tintId',
        {type: '@type', owner: '@owner', tintId: '@tintId'},
        {
            'find': { method: 'GET', isArray: false},
            'refresh': { method: 'POST', isArray: false},
            'persist': { method: 'PUT', isArray: false},
            'remove': { method: 'DELETE', isArray: false}
        }
    );
});
