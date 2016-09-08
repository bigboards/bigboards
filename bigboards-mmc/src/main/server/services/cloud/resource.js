var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function CloudResource(cloudService) {
    this.cloudService = cloudService;
}

CloudResource.prototype.sync = function(req, res) {
    return ApiUtils.handlePromise(res, this.cloudService.sync());
};

/*********************************************************************************************************************
 * LINK
 *********************************************************************************************************************/

CloudResource.prototype.pair = function(req, res) {
    return ApiUtils.handlePromise(res, this.cloudService.pair());
};

CloudResource.prototype.pairCallback = function(req, res) {
    return ApiUtils.handlePromise(res, this.cloudService.pairCallback(req.body.token));
};

CloudResource.prototype.unpair = function(req, res) {
    return ApiUtils.handlePromise(res, this.cloudService.unpair());
};

module.exports = CloudResource;
