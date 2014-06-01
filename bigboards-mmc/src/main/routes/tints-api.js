var Tints = require('../mods/tints.js');
var Tint = require('../mods/tint.js');
var Ansible = require('../mods/ansible.js');
var Activities = require('../mods/activities.js');

var ApiUtils = require('../utils/api-utils.js');

function TintsAPI(hex, library) {
    this.hex = hex;
    this.library = library;
}

TintsAPI.prototype.install = function(req, res) {
    // -- get the tint id parameter
    var tintId = req.body.tintId;
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var self = this;

    // -- get the tint from the library
    return this.library.get(tintId).then(function(tint) {
        try {
            self.hex.tintManager.install(tint);
            res.send(200);
        } catch (error) {
            ApiUtils.handleError(res, error);
        }

    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

TintsAPI.prototype.uninstall = function(req, res) {
    // -- get the tint id parameter
    var tintId = req.body.tintId;
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var self = this;

    // -- get the tint from the library
    return this.library.get(tintId).then(function(tint) {
        try {
            self.hex.tintManager.uninstall(tint);
            res.send(200);
        } catch (error) {
            ApiUtils.handleError(res, error);
        }

    }, function(error) {
        ApiUtils.handleError(res, error);
    });
};

TintsAPI.prototype.list = function(req, res) {
    Tints.list(this.config, function(err, tints) {
        if (err) return res.send(500, err);

        return res.send(tints);
    });
};

TintsAPI.prototype.get = function(req, res) {
    Tints.retrieveTint(this.config, function(err, tint) {
        if (err) return res.send(500, err);
        if (! tint) return res.send(404, "Tint not found");

        return res.send(tint.manifest);
    });
};

TintsAPI.prototype.actions = function(req, res) {
    var tintId = req.param('tint');
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return Tints.retrieveTint(this.config, function(err, tint) {
        if (err) return res.send(500, err);
        if (! tint) return res.send(404, "Tint not found");

        res.json(tint.actions);
    });
};

TintsAPI.prototype.parameters = function(req, res) {
    var tintId = req.param('tint');
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return Tints.retrieveTint(this.config, function(err, tint) {
        if (err) return res.send(500, err);
        if (! tint) return res.send(404, "Tint not found");

        return tint.retrieveParameters(function(err, parameters) {
            if (err) return res.send(500, err);

            return res.send(parameters);
        });
    });
};

TintsAPI.prototype.configuration = function(req, res) {
    var tintId = req.param('tint');
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return Tints.retrieveTint(this.config, function(err, tint) {
        if (err) return res.send(500, err);
        if (! tint) return res.send(404, "Tint not found");

        return tint.retrieveConfiguration(function(err, configuration) {
            if (err) return res.send(500, err);

            return res.send(configuration);
        });
    });
};

TintsAPI.prototype.views = function(req, res) {
    var tintId = req.param('tint');
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    return Tints.retrieveTint(this.config, function(err, tint) {
        if (err) return res.send(500, err);
        if (! tint) return res.send(404, "Tint not found");

        return tint.retrieveViews(config, function(err, views) {
            if (err) return res.send(500, err);

            return res.send(views);
        });
    });
};

TintsAPI.prototype.invokeAction = function(req, res) {
    var tintId = req.param('tint');
    if (! tintId) return res.send(400, "No Tint ID has been provided");

    var actionId = req.param('action');
    if (! actionId) return res.send(400, "No Action ID has been provided");

    return Ansible.invokeAction(tintId, actionId, function(err, output) {
        if (err) {
            Activities.add('ERROR', 'ACTION', 'FAILED', 'Failed to execute the ' + actionId + " action on tint " + tintId, output);

            return res.send(500, err);
        }

        Activities.add('INFO', 'ACTION', 'SUCCESS', 'Executed the ' + actionId + " action on tint " + tintId, output);
        return res.send(output);
    });
};

module.exports = TintsAPI;
