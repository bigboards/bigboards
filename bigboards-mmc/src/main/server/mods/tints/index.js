var fs = require("fs"),
    Tint = require("./tint.js"),
    Ansible = require("node-ansible"),
    async = require("async"),
    Q = require("q"),
    errors = require("../../errors.js"),
    yaml = require("js-yaml");

function TintManager(taskManager, tintDirectory, externalIp) {
    this.taskManager = taskManager;
    this.tintDirectory = tintDirectory;
    this.externalIp = externalIp;
}

/**
 * Get the list of installed tints.
 */
TintManager.prototype.list = function() {

};

/**
 * Get the tint with the given id.
 */
TintManager.prototype.get = function(id) {
    var deferred = Q.defer();
    var self = this;

    var directory = this.tintDirectory + '/' + id;

    var result = {
        id: id
    };

    async.parallel([
        function(callback) {
            fs.readFile(directory + "/.meta/manifest.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    result.manifest = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(directory + "/.meta/actions.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    result.actions = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(directory + "/.meta/components.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    result.components = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(directory + "/.meta/parameters.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    result.parameters = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(directory + "/.meta/views.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    result.views = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        }
    ], function(error) {
        if (error) deferred.reject(error);
        else deferred.resolve(result);
    });

    return deferred.promise;
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to install.
 */
TintManager.prototype.install = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('install_tint', {
        tintId: tint.id,
        tintUri: tint.uri
    });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint the tint we want to update
 */
TintManager.prototype.update = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('update_tint', { tintId: tint.id });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to uninstall.
 */
TintManager.prototype.uninstall = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('uninstall_tint', { tintId: tint.id });
};

module.exports = TintManager;
