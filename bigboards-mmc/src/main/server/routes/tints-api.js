var ApiUtils = require('../utils/api-utils.js');

function TintsAPI(tints, library) {
    this.tints = tints;
    this.library = library;
}

TintsAPI.prototype.stacks = function(req, res) {
    return this.tints.listTints('stack').then(function(tints) {
        res.send(200, tints);
    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

/**
 * Install the tint for which the id has been given.
 *
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.install = function(req, res) {
    var tint = req.body.tint;
    if (! tint) return res.send(400, "No tint information has been provided");

    var mapping = req.body.mapping;
    if (! mapping) return res.send(400, "No mapping information has been provided");

    try {
        this.tints.install(tint, mapping);
        return res.send(200);
    } catch (error) {
        return ApiUtils.handleError(res, error);
    }
};

/**
 * Uninstall the tint for which the id has been given.
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.uninstall = function(req, res) {
    var tint = req.body.tint;
    if (! tint) return res.send(400, "No tint information has been provided");

    try {
        this.tints.uninstall(tint);
        return res.send(200);
    } catch (error) {
        return ApiUtils.handleError(res, error);
    }
};

module.exports = TintsAPI;
