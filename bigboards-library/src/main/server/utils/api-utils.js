var winston = require('winston');

/**
 * Get the paging query parameters from the request if they are there.
 *
 * @param req   the request to examine for paging parameters
 */
module.exports.parsePaging = function(req) {
    var result = {};
    var hasPaging = false;

    if (req.param('o')) {
        result.offset = req.param('o');
        hasPaging = true;
    }

    if (req.param('s')) {
        result.size = req.param('s');
        hasPaging = true;
    }

    return (hasPaging) ? result : null;
};

module.exports.handleError = function(res, error) {
    winston.info(error);
    winston.info(error.stack);

    if (!error) return res.send(500, 'No reason given');

    if (error.name == 'NotFoundError') {
        return res.send(404, error);
    } else if (error.name == 'IllegalParameterError') {
        return res.send(400, error);
    } else {
        return res.send(500, error);
    }
};

module.exports.handlePromise = function(res, promise, privacyEnforcer, requestedScope) {
    return promise
        .then(function(results) {
            var response = results;

            if (privacyEnforcer && requestedScope) {
                response = privacyEnforcer.enforce(results, requestedScope);
            }

            return res.json(response);
        })
        .fail(function(error) {
            var msg = JSON.stringify(error, ['stack', 'message', 'inner'], 4);

            if (error.name == 'AlreadyExistsError') {
                res.status(400).send(msg);
            } else if (error.name == 'IllegalParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'BadPayloadError') {
                res.status(400).send(msg);
            } else if (error.name == 'MissingParameterError') {
                res.status(400).send(msg);
            } else if (error.name == 'NotFoundError') {
                res.status(404).send(msg);
            } else {
                res.status(500).send(msg);
            }
        });
};

module.exports.scopeLevel = function(scope) {
    if (scope == 'restricted') return 1;
    else if (scope == 'private') return 2;
    return 0;
};

module.exports.scopeName = function(scopeLevel) {
    if (scopeLevel == 1) return 'restricted';
    else if (scope == 2) return 'private';
    return 'global';
};

module.exports.registerGet = function(app, path, fn) {
    app.get(path, fn);
    winston.info('   [GET] ' + path);
};

module.exports.registerPut = function(app, path, fn) {
    app.put(path, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

module.exports.registerPost = function(app, path, fn) {
    app.post(path, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

module.exports.registerDelete = function(app, path, fn) {
    app.delete(path, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};

module.exports.asTribeMember = function(req, res, tribe, fn) {
    if (this.isAuthorized(req, tribe, 'MEMBER')) {
        return fn(req, res);
    } else {
        return res.send(401, 'The service is only available to members of the ' + tribe + ' tribe');
    }
};

module.exports.asTribeChief = function(req, res, tribe, fn) {
    if (this.isAuthorized(req, tribe, 'CHIEF')) {
        return fn(req, res);
    } else {
        return res.send(401, 'The service is only available to chiefs of the ' + tribe + ' tribe');
    }
};

module.exports.isAuthorized = function(req, organisation, role) {
    if (!req.profile) return false;

    // -- perform tribe validation if needed
    if (role != null || role != 'ANY') {
        // -- if you need to be a chief, you should have the tribe in your profile.chief
        if (role == 'CHIEF' && req.profile.chief.indexOf(organisation) == -1) return false;

        // -- if you need to be a member, you should have the tribe in your profile.tribes
        if (role == 'MEMBER' && req.profile.organisations.indexOf(organisation) == -1) return false;
    }

    return true;
};