var Ansible = require('../mods/ansible.js');

var ApiUtils = require('../utils/api-utils.js');

function TintsAPI(tints, library) {
    this.tints = tints;
    this.library = library;
}

/**
 * List the tints currently installed on this hex.
 *
 * @param req
 * @param res
 */
TintsAPI.prototype.list = function(req, res) {
    var type = req.params['type'];

    var promise = null;
    if (type) promise = this.tints.listByType(type);
    else promise = this.tints.listAll();

    return promise.then(function(tints) {
        res.send(200, tints);
    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

/**
 * Get information about the tint for which the id has been given.
 *
 * @param req
 * @param res
 */
TintsAPI.prototype.get = function(req, res) {
    // -- get the tint parameters
    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var tintType = req.params['type'];
    if (! tintType) return res.send(400, "No Tint type has been provided");

    return this.tints
        .get(tintType, tintId)
        .then(function(tint) { res.send(200, tint); })
        .fail(function(error) { ApiUtils.handleError(res, error); });
};

/**
 * Get the configuration of the current tint.
 *
 * @param req
 * @param res
 */
TintsAPI.prototype.getConfiguration = function(req, res) {
    // -- get the tint id parameter
    var type = req.params['type'];
    if (! type) return res.send(400, "No type has been provided");

    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return this.tints
        .getConfiguration(type, tintId)
        .then(function(configuration) { res.send(200, configuration);})
        .fail(function(error) { ApiUtils.handleError(res, error); });
};

/**
 * Update the configuration of the given tint.
 *
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.configure = function(req, res) {
    // -- get the tint id parameter
    var type = req.params['type'];
    if (! type) return res.send(400, "No type has been provided");

    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return this.tints
        .configure(type, tintId)
        .then(function(feedback) { res.send(200, feedback);})
        .fail(function(error) { ApiUtils.handleError(res, error); });
};

/**
 * Install the tint for which the id has been given.
 *
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.install = function(req, res) {
    // -- get the tint id parameter
    var type = req.params['type'];
    if (! type) return res.send(400, "No type has been provided");

    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var self = this;

    // -- get the tint from the library
    return this.library.get(tintId).then(function(tint) {
        try {
            self.tints.install(tint);
            res.send(200);
        } catch (error) {
            ApiUtils.handleError(res, error);
        }

    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

/**
 * Update the tint for which the id has been given.
 *
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.update = function(req, res) {
    // -- get the tint id parameter
    var type = req.params['type'];
    if (! type) return res.send(400, "No type has been provided");

    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var self = this;

    // -- get the tint from the library
    return this.library.get(tintId).then(function(tint) {
        try {
            self.tints.update(tint);
            res.send(200);
        } catch (error) {
            ApiUtils.handleError(res, error);
        }

    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

/**
 * Uninstall the tint for which the id has been given.
 * @param req
 * @param res
 * @returns {*}
 */
TintsAPI.prototype.uninstall = function(req, res) {
    // -- get the tint id parameter
    var type = req.params['type'];
    if (! type) return res.send(400, "No type has been provided");

    var tintId = req.params['tintId'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var self = this;

    // -- get the tint from the library
    return this.library.get(tintId).then(function(tint) {
        try {
            self.tints.uninstall(tint);
            res.send(200);
        } catch (error) {
            ApiUtils.handleError(res, error);
        }

    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

//TintsAPI.prototype.invokeAction = function(req, res) {
//    var tintId = req.param('tint');
//    if (! tintId) return res.send(400, "No Tint ID has been provided");
//
//    var actionId = req.param('action');
//    if (! actionId) return res.send(400, "No Action ID has been provided");
//
//    return Ansible.invokeAction(tintId, actionId, function(err, output) {
//        if (err) {
//            Activities.add('ERROR', 'ACTION', 'FAILED', 'Failed to execute the ' + actionId + " action on tint " + tintId, output);
//
//            return res.send(500, err);
//        }
//
//        Activities.add('INFO', 'ACTION', 'SUCCESS', 'Executed the ' + actionId + " action on tint " + tintId, output);
//        return res.send(output);
//    });
//};

module.exports = TintsAPI;
