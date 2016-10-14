angular
    .module('bb.setup')
    .factory('CloudClusters', CloudClusters);

CloudClusters.$Inject = ['$resource', 'Notifications'];

function CloudClusters($resource, Notifications) {
    var service = {
        validate: {
            name: validateName
        }
    };

    var setupValidationResource = $resource(
        'api/v1/setup/validate/:type',
        { },
        {
            user: { method: 'GET', isArray: false, params: { type: 'user'} },
            clustername: { method: 'GET', isArray: false, params: { type: 'name'} }
        }
    );

    return service;

    function validateName(name) {
        return setupValidationResource.clustername({name: name}).$promise
            .then(function(response, data) {
                return response;
            }, function (error) {
                Notifications.error(error.message)
            });
    }
}