angular
    .module('bb.setup')
    .factory('Setup', Setup);

Setup.$Inject = ['$resource', 'Notifications'];

function Setup($resource, Notifications) {
    var service = {
        validate: {
            name: validateName,
            shortId: validateShortId
        },
        process: process,
        exit: exit
    };

    var setupResource = $resource(
        'api/v1/setup',
        { },
        {
            process: { method: 'POST' }
        }
    );

    var setupExitResource = $resource(
        'api/v1/setup/exit',
        { },
        {
            process: { method: 'POST' }
        }
    );

    var setupValidationResource = $resource(
        'api/v1/setup/validate/:type',
        { },
        {
            shortId: { method: 'GET', isArray: false, params: { type: 'shortId'} },
            clustername: { method: 'GET', isArray: false, params: { type: 'name'} }
        }
    );

    return service;

    function validateName(name) {
        return setupValidationResource.clustername({name: name}).$promise
            .then(function(response, data) {
                return response;
            }, function (error) {
                Notifications.error(error.data.error);
                return error;
            });
    }

    function validateShortId(name) {
        return setupValidationResource.shortId({name: name}).$promise
            .then(function(response, data) {
                return response;
            }, function (error) {
                Notifications.error(error.data.error);
                return error;
            });
    }

    function process(clusterName, shortId, nodes) {
        return setupResource.process({}, {clusterName: clusterName, shortId: shortId, nodes: nodes}).$promise
            .then(function(response, data) {
                return response;
            }, function (error) {
                Notifications.error(error.data.error);
                throw error;
            });
    }

    function exit() {
        return setupExitResource.exit().$promise
            .then(function(response, data) {
                return response;
            }, function (error) {
                Notifications.error(error.data.error);
                return error;
            });
    }
}