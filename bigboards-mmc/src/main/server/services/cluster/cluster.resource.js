var ApiUtils = require('../../utils/api-utils'),
    ClusterService = require('./node.service');

var log4js = require('log4js');
var logger = log4js.getLogger('cluster.resource');

function ClusterResource() {
    this.service = new ClusterService();

    logger.debug("Created the cluster resource");
}

ClusterResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.list());
};

ClusterResource.prototype.powerdown = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.powerdown());
};

module.exports = ClusterResource;
