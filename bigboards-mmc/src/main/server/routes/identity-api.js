var ApiUtils = require('../utils/api-utils.js');

function IdentityAPI(configuration) {
    this.configuration = configuration;
}

IdentityAPI.prototype.get = function(req, res) {
    return this.configuration.load().done(function(data) {
        res.send(200, data);
    }, function (error) {
        ApiUtils.handleError(res, error);
    });
};

module.exports = IdentityAPI;
