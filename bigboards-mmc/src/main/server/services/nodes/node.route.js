var NodeResource = require('./node.resource');

var log4js = require('log4js');
var logger = log4js.getLogger('node.route');

module.exports = function(app, io) {
    var resource = new NodeResource();

    API.registerGet(app, '/api/v1/hex/nodes', function(req, res) { return resource.list(req, res); });

    logger.debug("Routed the node endpoints");
};
