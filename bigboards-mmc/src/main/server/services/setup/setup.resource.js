var ApiUtils = require('../../utils/api-utils'),
    SetupService = require('./setup.service');

var log4js = require('log4js');
var logger = log4js.getLogger('setup.resource');

function SetupResource() {
    this.service = new SetupService();

    logger.debug("Created the setup resource");
}

SetupResource.prototype.validateName = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.validateName(req.query.name));
};

SetupResource.prototype.validateShortId = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.validateShortId(req.query.short_id));
};

SetupResource.prototype.setup = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.setup(req.body.name, req.body.shortId));
};

SetupResource.prototype.exit = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.exit());
};

module.exports = SetupResource;
