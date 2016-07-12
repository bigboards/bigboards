var winston = require('winston'),
    API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    prepare: function(settings, services) { },
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.metrics);

        API.registerGet(app, '/api/v1/metrics/:report', function(req, res) { return resource.getClusterReport(req, res); });
        API.registerGet(app, '/api/v1/metrics/:report/:node', function(req, res) { return resource.getNodeReport(req, res); });
    }
};