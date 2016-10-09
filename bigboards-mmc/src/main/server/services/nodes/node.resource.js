var ApiUtils = require('../../utils/api-utils'),
    NodeService = require('./node.service');

var log4js = require('log4js');
var logger = log4js.getLogger('node.resource');

function NodeResource() {
    this.service = new NodeService();

    logger.debug("Created the node resource");
}

NodeResource.prototype.list = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.list());
};

module.exports = NodeResource;
