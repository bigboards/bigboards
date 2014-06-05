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
            if (! fs.exists(directory + "/.meta/actions.yml")) return callback();

            return fs.readFile(directory + "/.meta/actions.yml", {'encoding': 'utf8'}, function(err, data) {
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
            if (! fs.exists(directory + "/.meta/components.yml")) return callback();

            return fs.readFile(directory + "/.meta/components.yml", {'encoding': 'utf8'}, function(err, data) {
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
            if (! fs.exists(directory + "/.meta/parameters.yml")) return callback();

            return fs.readFile(directory + "/.meta/parameters.yml", {'encoding': 'utf8'}, function(err, data) {
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
            if (! fs.exists(directory + "/.meta/views.yml")) return callback();

            return fs.readFile(directory + "/.meta/views.yml", {'encoding': 'utf8'}, function(err, data) {
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

TintManager.prototype.config = function(id) {
    var deferred = Q.defer();
    var self = this;

    var directory = this.tintDirectory + '/' + id;

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
