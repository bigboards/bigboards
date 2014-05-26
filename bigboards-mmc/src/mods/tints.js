var fs = require("fs"),
    yaml = require("js-yaml"),
    async = require("async"),
    S = require("string"),
    Tint = require("./tint.js");

/**
 * Get the current tints.
 *
 * @param config   the application config
 * @param cb       the callback which is executed when the result is ready
 */
module.exports.retrieveTint = function(config, cb) {
    // -- read the contents of the tints directory.
    fs.readdir(config.tints.rootDirectory, function(err, files) {
        if (err) return cb(err);

        var responded = false;
        files.forEach(function(file) {
            // -- return if we can't find a tints sub-dir
            if (! fs.existsSync(config.tints.rootDirectory + "/" + file + "/.meta")) return;

            // -- read the tints manifest
            try {
                var tint = new Tint(file, config.tints.rootDirectory + "/" + file);
                responded = true;
                return cb(null, tint);
            } catch (e) {
                responded = true;
                return cb(e);
            }
        });

        if (! responded) return cb(null, null);
    });
};

/**
 * List the tints which are placed inside the tints directory.
 *
 *  Currently we only allow a single tints to be installed
 *
 * @param config   the application config
 * @param cb        the callback which is executed when the result is ready
 */
module.exports.list = function(config, cb) {
    // -- read the contents of the tints directory.
    fs.readdir(config.tints.rootDirectory, function(err, files) {
        if (err) return cb(err);

        var result = [];

        files.forEach(function(file) {
            // -- return if we can't find a tints sub-dir
            if (! fs.existsSync(config.tints.rootDirectory + "/" + file + "/" + config.tints.metaDirectory + "")) return;

            // -- read the tints manifest
            try {
                result.push(new Tint(file, config.tints.rootDirectory + "/" + file));
            } catch (e) { }
        });

        cb(null, result);
    });
};