var API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.library);

        API.registerGet(app, '/api/v1/library/:type', function(req, res) { return resource.listTintsForType(req, res); });
        API.registerGet(app, '/api/v1/library/:type/:owner', function(req, res) { return resource.listTintsForOwner(req, res); });
        API.registerGet(app, '/api/v1/library/:type/:owner/:tintId', function(req, res) { return resource.getTint(req, res); });
        API.registerPost(app, '/api/v1/library', function(req, res) { return resource.refresh(req, res); });
        API.registerPut(app, '/api/v1/library/:type/:owner/:tintId', function(req, res) { return resource.createTint(req, res); });
        API.registerDelete(app, '/api/v1/library/:type/:owner/:tintId', function(req, res) { return resource.removeTint(req, res); });
    }
};