var SetupResource = require('./setup.resource'),
    API = require('../../utils/api-utils');

var log4js = require('log4js');
var logger = log4js.getLogger('setup.route');

module.exports = function(app, io) {
    var resource = new SetupResource();

    API.registerGet(app, '/api/v1/setup/validate/name', function(req, res) { return resource.validateName(req, res); });
    API.registerGet(app, '/api/v1/setup/validate/shortId', function(req, res) { return resource.validateShortId(req, res); });
    API.registerPost(app, '/api/v1/setup', function(req, res) { return resource.setup(req, res); });
    API.registerPost(app, '/api/v1/setup/exit', function(req, res) { return resource.exit(req, res); });

    logger.debug("Routed the setup endpoints");
};
