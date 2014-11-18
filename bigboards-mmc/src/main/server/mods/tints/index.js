var fs = require("fs"),
    Tint = require("./tint.js"),
    async = require("async"),
    Q = require("q"),
    errors = require("../../errors.js"),
    yaml = require("js-yaml"),
    fsu = require('../../utils/fs-utils');

function TintManager(taskService, nodeService, tintDirectory, templater) {
    this.taskManager = taskService;
    this.tintDirectory = tintDirectory;
    this.templater = templater;
    this.nodeService = nodeService;
}

TintManager.prototype.listAll = function() {
    var self = this;

    return fsu
        .readDir(this.tintDirectory)
        .then(function(files) {
            var promises = [];

            files.forEach(function(file) {
                promises.push(self.listByType(file));
            });

            return Q.all(promises).then(function(outcomes) {
                var result = [];

                outcomes.forEach(function(outcome) {
                    outcome.forEach(function(row) {
                        result.push(row);
                    });
                });

                return result;
            });
        });
};

/**
 * Get the list of installed tints by giving their type.
 */
TintManager.prototype.listByType = function(type) {
    var self = this;

    return fsu
        .readDir(this.tintDirectory + '/' + type)
        .then(function(files) {
            var promises = [];

            files.forEach(function(file) {
                promises.push(readManifest(self.nodeService, self.templater, self.tintDirectory + '/' + type + '/' + file));
            });

            return Q.all(promises);
        });
};

/**
 * Get the tint with the given id.
 */
TintManager.prototype.get = function(type, id) {
    return readManifest(this.nodeService, this.templater, this.tintDirectory + '/' + type + '/' + id);
};

/**
 * Get the configuration for the given tint.
 *
 * @param type  the type of tint for which to retrieve the configuration
 * @param id    the id of the tint for which to retrieve the configuration
 * @returns {*}
 */
TintManager.prototype.getConfiguration = function(type, id) {
    var deferred = Q.defer();
    var self = this;

    var directory = this.tintDirectory + '/' + type + '/' + id;

    var parameters = [];
    var result = {
        all: [],
        groups: {},
        hosts: {}
    };

    async.parallel([
        function(callback) {
            parameters = yaml.safeLoad(fs.readFileSync(directory + "/.meta/parameters.yml", 'utf8'));

            callback();
        },
        function(callback) {
            // -- let's start with the group configurations
            fs.readdir(directory + "/group_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(directory + "/group_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    if (file == 'all') result.all = data.droplet;
                    else result.groups[file] = data.droplet;
                });

                return callback();
            });
        },
        function(callback) {
            if (! fs.exists(directory + "/host_vars")) return callback();

            // -- and end with the host configurations
            return fs.readdir(directory + "/host_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(directory + "/host_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    result.hosts[file] = data.droplet;
                });

                return callback();
            });
        }
    ], function(err) {
        if (err) return deferred.reject(err);

        var arr = [];

        parameters.forEach(function(param) {
            if (!param.parameter) return;

            param.values = {all: null, groups: {}, hosts: {}};

            param.values.all = result.all[param.parameter];

            // -- iterate the groups
            Object.keys(result.groups).forEach(function(group) {
                param.values.groups[group] = result.groups[group][param.parameter];
            });

            // -- iterate the hosts
            Object.keys(result.hosts).forEach(function(host) {
                param.values.hosts[host] = result.hosts[host][param.parameter];
            });

            arr.push(param);
        });

        // -- return the result
        return deferred.resolve(arr);
    });

    return deferred.promise;
};

/**
 * TODO
 * @param type
 * @param id
 * @returns {*}
 */
TintManager.prototype.configure = function(type, id) {
    var deferred = Q.defer();
    var self = this;

    var directory = this.tintDirectory + '/' + type + '/' + id;

    var parameters = [];
    var result = {
        all: [],
        groups: {},
        hosts: {}
    };

    async.parallel([
        function(callback) {
            parameters = yaml.safeLoad(fs.readFileSync(directory + "/.meta/parameters.yml", 'utf8'));

            callback();
        },
        function(callback) {
            // -- let's start with the group configurations
            fs.readdir(directory + "/group_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(directory + "/group_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    if (file == 'all') result.all = data.droplet;
                    else result.groups[file] = data.droplet;
                });

                return callback();
            });
        },
        function(callback) {
            if (! fs.exists(directory + "/host_vars")) return callback();

            // -- and end with the host configurations
            return fs.readdir(directory + "/host_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(directory + "/host_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    result.hosts[file] = data.droplet;
                });

                return callback();
            });
        }
    ], function(err) {
        if (err) return deferred.reject(err);

        var arr = [];

        parameters.forEach(function(param) {
            if (!param.parameter) return;

            param.values = {all: null, groups: {}, hosts: {}};

            param.values.all = result.all[param.parameter];

            // -- iterate the groups
            Object.keys(result.groups).forEach(function(group) {
                param.values.groups[group] = result.groups[group][param.parameter];
            });

            // -- iterate the hosts
            Object.keys(result.hosts).forEach(function(host) {
                param.values.hosts[host] = result.hosts[host][param.parameter];
            });

            arr.push(param);
        });

        // -- return the result
        return deferred.resolve(arr);
    });

    return deferred.promise;
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to install.
 */
TintManager.prototype.install = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format: no tint uri has been given");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format: no tint id has been given");
    if (! tint.type) throw new errors.IllegalParameterError("Invalid tint format: no tint type has been given");

    return this.taskManager.invoke('tint_install', {
        tintId: tint.id,
        tintUri: tint.uri,
        tintType: tint.type
    });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint the tint we want to update
 */
TintManager.prototype.update = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format: no tint uri has been given");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format: no tint id has been given");
    if (! tint.type) throw new errors.IllegalParameterError("Invalid tint format: no tint type has been given");

    return this.taskManager.invoke('tint_update', { tintId: tint.id });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to uninstall.
 */
TintManager.prototype.uninstall = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format: no tint uri has been given");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format: no tint id has been given");
    if (! tint.type) throw new errors.IllegalParameterError("Invalid tint format: no tint type has been given");

    return this.taskManager.invoke('tint_uninstall', {
        tintId: tint.id,
        tintType: tint.type
    });
};


function readManifest(nodeService, templater, tintDir) {
    return nodeService
        .nodes()
        .then(function (nodes) {
            return yaml.safeLoad(templater.template(tintDir + "/.meta/manifest.yml", nodes));
        });
}

module.exports = TintManager;
