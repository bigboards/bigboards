angular.module('mmc')
    .factory('Metrics', Metrics);

Metrics.$inject = [ 'settings', '$resource' ];

function Metrics(settings, $resource) {
    var resource = $resource(
        settings.api + '/api/v1/metrics/:report/:node',
        {  report: '@report', node: '@node' },
        {
            list: { method: 'GET', isArray: true }
        });

    return {
        list: list
    };

    function list(report, node) {
        var data = { report: report };

        if (node) data.node = node;

        return resource.list(data).$promise;
    }

}