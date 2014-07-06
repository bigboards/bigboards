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
    return this.tints.list().then(function(tints) {
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
    // -- get the tint id parameter
    var tintId = req.body.tint;
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
    var tintId = req.body.tintId;
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
    var tintId = req.params.tintId;
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

/**
 * Get information about the tint for which the id has been given.
 *
 * @param req
 * @param res
 */
TintsAPI.prototype.get = function(req, res) {
    // -- get the tint id parameter
    var tintId = req.params['tint'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return this.tints.get(tintId).then(function(tint) {
        res.send(200, tint);
    }).fail(function(error) {
        ApiUtils.handleError(res, error);
    });
};

/**
 * Get the configuration of the current tint.
 *
 * @param req
 * @param res
 */
TintsAPI.prototype.config = function(req, res) {
    // -- get the tint id parameter
    var tintId = req.params['tint'];
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return this.tints.config(tintId).then(function(configuration) {
        res.send(200, configuration);
    }).fail(function(error) {
        ApiUtils.handleError(res, error);
    });
};

//TintsAPI.prototype.actions = function(req, res) {
//    var tintId = req.param('tint');
//    if (! tintId) return res.send(400, "No Tint ID has been provided");
//
//    return Tints.retrieveTint(this.config, function(err, tint) {
//        if (err) return res.send(500, err);
//        if (! tint) return res.send(404, "Tint not found");
//
//        res.json(tint.actions);
//    });
//};
//
//TintsAPI.prototype.parameters = function(req, res) {
//    var tintId = req.param('tint');
//    if (! tintId) return res.send(400, "No Tint ID has been provided");
//
//    return Tints.retrieveTint(this.config, function(err, tint) {
//        if (err) return res.send(500, err);
//        if (! tint) return res.send(404, "Tint not found");
//
//        return tint.retrieveParameters(function(err, parameters) {
//            if (err) return res.send(500, err);
//
//            return res.send(parameters);
//        });
//    });
//};
//
//TintsAPI.prototype.configuration = function(req, res) {
//    var tintId = req.param('tint');
//    if (! tintId) return res.send(400, "No Tint ID has been provided");
//
//    return Tints.retrieveTint(this.config, function(err, tint) {
//        if (err) return res.send(500, err);
//        if (! tint) return res.send(404, "Tint not found");
//
//        return tint.retrieveConfiguration(function(err, configuration) {
//            if (err) return res.send(500, err);
//
//            return res.send(configuration);
//        });
//    });
//};
//
//TintsAPI.prototype.views = function(req, res) {
//    var tintId = req.param('tint');
//    if (! tintId) return res.send(400, "No Tint ID has been provided");
//
//    return Tints.retrieveTint(this.config, function(err, tint) {
//        if (err) return res.send(500, err);
//        if (! tint) return res.send(404, "Tint not found");
//
//        return tint.retrieveViews(config, function(err, views) {
//            if (err) return res.send(500, err);
//
//            return res.send(views);
//        });
//    });
//};
//
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
