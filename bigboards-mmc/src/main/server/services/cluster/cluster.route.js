var ClusterResource = require('./cluster.resource'),
    API = require('../../utils/api-utils');

var log4js = require('log4js');
var logger = log4js.getLogger('cluster.route');

module.exports = function(app, io) {
    var resource = new ClusterResource();

    API.registerGet(app, '/api/v1/hex', function(req, res) { return resource.get(req, res); });
    API.registerDelete(app, '/api/v1/hex', function(req, res) { return resource.powerdown(req, res); });

    logger.debug("Routed the cluster endpoints");
};
