var ApiUtils = require('../../utils/api-utils'),
    SetupService = require('./setup.service');

var log4js = require('log4js');
var logger = log4js.getLogger('setup.resource');

function SetupResource(io) {
    this.service = new SetupService();
    this.io = io;

    logger.debug("Created the setup resource");
}

SetupResource.prototype.validateName = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.validateName(req.query.name));
};

SetupResource.prototype.validateShortId = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.validateShortId(req.query.short_id));
};

SetupResource.prototype.setup = function(req, res) {
    var self = this;

    try {
        this.service.setup(req.body.name, req.body.shortId, req.body.nodes).then(
            function (data) {
                self.io.emit('setup.done', data);
            }, function (error) {
                self.io.emit('setup.fail', { error: error });
            }, function (progress) {
                self.io.emit('setup.busy', progress);
            }
        );

        res.status(200).json({scheduled: true});
    } catch (err) {
        res.status(500).json({ error: err.message || err.name });
    }
};

SetupResource.prototype.exit = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.exit());
};

module.exports = SetupResource;
