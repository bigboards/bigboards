var fs = require("fs"),
    yaml = require("js-yaml"),
    async = require("async"),
    S = require("string");

function Tint(id, directory) {
    this.id = id;
    this.directory = directory;

    var self = this;

    async.parallel([
        function(callback) {
            fs.readFile(self.directory + "/.meta/manifest.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    self.manifest = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(self.directory + "/.meta/actions.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    self.actions = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(self.directory + "/.meta/components.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    self.components = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(self.directory + "/.meta/parameters.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    self.parameters = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        },
        function(callback) {
            fs.readFile(self.directory + "/.meta/views.yml", {'encoding': 'utf8'}, function(err, data) {
                if (err) return callback(err);

                try {
                    self.views = yaml.safeLoad(data);
                } catch (ex) {
                    return callback(ex);
                }

                return callback();
            });
        }
    ]);
}

/**
 * Retrieve the configuration of all groups and nodes.
 *
 * @param cb            the callback which will be called with the result
 */
Tint.prototype.retrieveConfiguration = function(cb) {
    var parameters = [];
    var result = {
        all: [],
        groups: {},
        hosts: {}
    };

    var me = this;

    async.parallel([
        function(callback) {
            parameters = yaml.safeLoad(fs.readFileSync(me.directory + "/.meta/parameters.yml", 'utf8'));

            callback();
        },
        function(callback) {
            // -- let's start with the group configurations
            fs.readdir(me.directory + "/group_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(me.directory + "/group_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    if (file == 'all') result.all = data.droplet;
                    else result.groups[file] = data.droplet;
                });

                return callback();
            });
        },
        function(callback) {
            // -- and end with the host configurations
            fs.readdir(me.directory + "/host_vars", function(err, files) {
                if (err) return callback(err);

                files.forEach(function(file) {
                    var data = yaml.safeLoad(fs.readFileSync(me.directory + "/host_vars/" + file, 'utf8'));

                    // -- skip processing if there is no tints property
                    if (! data.droplet) return;

                    result.hosts[file] = data.droplet;
                });

                return callback();
            });
        }
    ], function(err) {
        if (err) return cb(err);

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
        return cb(null, arr);
    });
};

module.exports = Tint;

