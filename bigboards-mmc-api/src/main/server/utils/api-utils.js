var winston = require('winston');

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

module.exports.handlePromise = function(res, promise) {
    return promise
        .then(function(results) {
            return res.json(results);
        })
        .fail(function(error) {
            if (error.name == 'AlreadyExistsError') {
                res.status(400).send(error.message);
            } else if (error.name == 'IllegalParameterError') {
                res.status(400).send(error.message);
            } else if (error.name == 'BadPayloadError') {
                res.status(400).send(error.message);
            } else if (error.name == 'MissingParameterError') {
                res.status(400).send(error.message);
            } else if (error.name == 'NotFoundError') {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        });
};

module.exports.registerGet = function(app, path, fn) {
    app.get(path, fn);
    winston.info('   [GET] ' + path);
};

module.exports.registerPut = function(app, path, fn) {
    app.get(path, function(req, res) { return fn(req, res); });
    winston.info('   [PUT] ' + path);
};

module.exports.registerPost = function(app, path, fn) {
    app.post(path, function(req, res) { return fn(req, res); });
    winston.info('  [POST] ' + path);
};

module.exports.registerDelete = function(app, path, fn) {
    app.get(path, function(req, res) { return fn(req, res); });
    winston.info('[DELETE] ' + path);
};
