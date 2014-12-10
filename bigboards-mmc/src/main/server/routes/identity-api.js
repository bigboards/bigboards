var ApiUtils = require('../utils/api-utils.js');

function IdentityAPI(configuration) {
    this.configuration = configuration;
}

/**
 * @api {get} /api/v1/identity Get the identity information of this hex.
 * @apiName GetIdentity
 * @apiGroup Identity
 */
IdentityAPI.prototype.get = function(req, res) {
    return this.configuration.load().done(function(data) {
        res.send(200, data);
    }, function (error) {
        ApiUtils.handleError(res, error);
    });
};

module.exports = IdentityAPI;
