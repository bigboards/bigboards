angular
    .module('bb.setup')
    .factory('CloudUsers', CloudUsers);

CloudUsers.$Inject = ['$resource', 'Notifications'];

function CloudUsers($resource, Notifications) {
    var service = {
        validateShortId: validateShortId
    };

    var cloudPeopleExistsResource = $resource(
        'http://api.hive.test.bigboards.io/api/v1/people/:id/exists',
        { id: '@id' },
        {
            validate: { method: 'GET', isArray: false }
        }
    );

    return service;

    function validateShortId(shortId) {
        return cloudPeopleExistsResource.validate({id: shortId}).$promise
            .then(function(response) { return response; }, function (error) {
                Notifications.error(error.message)
            });
    }
}