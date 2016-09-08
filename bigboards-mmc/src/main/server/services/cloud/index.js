var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    prepare: function(settings, services) { },
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.cloud);

        API.registerPost(app, '/api/v1/cloud/sync', function(req, res) { return resource.sync(req, res); });
        API.registerPost(app, '/api/v1/cloud/pair', function(req, res) { return resource.pair(req, res); });
        API.registerPost(app, '/api/v1/cloud/pair/callback', function(req, res) { return resource.pairCallback(req, res); });
        API.registerDelete(app, '/api/v1/cloud/unpair', function(req, res) { return resource.unpair(req, res); });
    }
};