var libraryModule = angular.module('bb.library', ['ngResource']);

libraryModule.controller('LibraryController', ['$scope', 'Library', 'Hex', function($scope,   Library, Hex) {
    Hex.getIdentity().then(function(config) {
        if (config['hive.user.id']) {
            Library.list({owner: config['hive.user.id']}).then(function(data) {
                $scope.myTints = data.data;
            });
        } else {
            $scope.myTints = [];
        }
    });

    $scope.searchModel = {
        query: ""
    };

    $scope.search = function() {
        Library
            .search($scope.searchModel)
            .then(function(data) {
                $scope.allTints = data.data;
            });
    };

    $scope.search();
}]);

libraryModule.controller('LibraryItemViewController', ['$scope', '$location', 'tint', 'ApiFeedback', 'Hex', '$routeParams', function($scope, $location, tint, ApiFeedback, Hex, $routeParams) {
    $scope.tint = tint;
    $scope.isInstalled = null;
    $scope.tintDetails = 'app/library/partials/empty.html';

    $scope.tintDetails = 'app/library/partials/' + $scope.tint.type + '.html';
    Hex.isInstalled($scope.tint.type, $scope.tint.owner, $scope.tint.slug).then(function(isInstalled) {
        $scope.isInstalled = isInstalled;
    });

    $scope.install = function() {
        Hex.install(
            { tint: $scope.tint },
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

libraryModule.service('Library', ['settings', '$http', function(settings, $http) {
    var Library = function Library() {
        this.options = {};

        if (settings.hive_token) {
            this.options.headers = {'Authorization': 'Bearer ' + settings.hive_token};
        }
    };

    Library.prototype.get = function(type, owner, slug) {
        var url = settings.hive.protocol + '://' + settings.hive.host + ':' + settings.hive.port + settings.hive.path + '/' + type + '/' + owner + '/' + slug;
        return $http.get(url, this.options).then(function(data) {
            return data.data;
        });
    };

    Library.prototype.search = function(query, offset, size) {
        var url = settings.hive.protocol + '://' + settings.hive.host + ':' + settings.hive.port + settings.hive.path;

        var queryParameters = [];
        if (query.query) queryParameters.push('q=' + encodeURIComponent(query.query) + "*");

        // -- check for paging parameters
        if (offset) queryParameters.push('f=' + offset);
        if (size) queryParameters.push('s=' + size);

        // -- check for architecture or firmware
        if (query.architecture) queryParameters.push('architecture=' + encodeURIComponent(query.architecture));
        if (query.firmware) queryParameters.push('firmware=' + encodeURIComponent(query.firmware));

        // -- check for scope
        if (query.scope) queryParameters.push('scope=' + encodeURIComponent(query.scope));

        // -- check for type
        if (query.type) queryParameters.push('t=' + encodeURIComponent(query.type));

        // -- check for owner or collaborator
        if (query.owner) {
            queryParameters.push('o=' + encodeURIComponent(query.owner));
            queryParameters.push('c=' + encodeURIComponent(query.owner));
        }

        if (queryParameters.length > 0) {
            url += ('?' + queryParameters.join('&'))
        }

        return $http.get(url, this.options).then(function(data) {
            return data.data;
        });
    };

    Library.prototype.list = function(query) {
        var url = settings.hive.protocol + '://' + settings.hive.host + ':' + settings.hive.port + settings.hive.path;

        var queryParameters = [];
        if (query.scope) queryParameters.push('scope=' + encodeURIComponent(query.scope));
        if (query.type) queryParameters.push('t=' + encodeURIComponent(query.type));
        if (query.owner) {
            queryParameters.push('o=' + encodeURIComponent(query.owner));
            queryParameters.push('c=' + encodeURIComponent(query.owner));
        }

        if (queryParameters.length > 0) {
            url += ('?' + queryParameters.join('&'))
        }

        return $http.get(url, this.options).then(function(data) {
            return data.data;
        });
    };

    return new Library();
}]);
