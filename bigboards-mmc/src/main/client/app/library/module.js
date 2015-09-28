var libraryModule = angular.module('bb.library', ['ngResource']);

libraryModule.controller('LibraryController', ['$scope', 'Library', 'stacks', 'tutorials', function($scope,   Library,   stacks, tutorials) {
    $scope.library = {
        stacks: stacks.data,
        tutorials: tutorials.data
    };
}]);

libraryModule.controller('LibraryItemViewController', ['$scope', '$location', 'tint', 'ApiFeedback', 'Hex', '$routeParams', function($scope, $location, tint, ApiFeedback, Hex, $routeParams) {
    $scope.tint = tint;
    $scope.isInstalled = null;
    $scope.tintDetails = 'app/library/partials/empty.html';

    $scope.tintDetails = 'app/library/partials/' + $scope.tint.data.type + '.html';
    Hex.isInstalled($scope.tint.data.type, $scope.tint.data.owner, $scope.tint.data.slug).then(function(isInstalled) {
        $scope.isInstalled = isInstalled;
    });

    $scope.install = function() {
        Hex.install(
            { tint: $scope.tint.data },
            function(attempt) {
                $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
            },
            ApiFeedback.onError()
        );
    };

    $scope.uninstall = function() {
        var confirmed = confirm("Are you sure? This will remove the tint from the hex.");

        if (confirmed) {
            Hex.uninstall(
                {
                    type: $scope.tint.data.type,
                    owner: $scope.tint.data.owner,
                    slug: $scope.tint.data.slug
                },
                function(attempt) {
                    $location.path('/tasks/' + attempt.task.code + '/attempts/' + attempt.attempt + '/output');
                },
                ApiFeedback.onError()
            );
        }
    };
}]);


libraryModule.service('Library', ['settings', '$http', function(settings, $http) {
    var Library = function Library() {

    };

    Library.prototype.get = function(type, owner, slug) {
        var url = 'http://' + settings.hive.host + ':' + settings.hive.port + settings.hive.path + '/' + type + '/' + owner + '/' + slug;
        return $http.get(url).then(function(data) {
            return data.data;
        });
    };

    Library.prototype.find = function(type, owner) {
        var url = 'http://' + settings.hive.host + ':' + settings.hive.port + settings.hive.path;
        if (type) url += ('/' + type);
        if (owner) url += ('/' + owner);

        return $http.get(url).then(function(data) {
            return data.data;
        });
    };

    return new Library();
}]);
