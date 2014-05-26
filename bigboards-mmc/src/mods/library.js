var fs = require("fs"),
    yaml = require("js-yaml"),
    Q = require("q"),
    exec = require('child_process').exec,
    winston = require('winston'),
    rest = require('restler');

function Library(tintRepoConfigFile) {
    this.tintRepoConfigFile = tintRepoConfigFile;
    this.libraryContent = {};

    var self = this;
    fs.exists(tintRepoConfigFile, function (exists) {
        if (! exists)
            self.persist();
        else
            self.load();
    });
}

Library.prototype.get = function(tintId) {
    var deferrer = Q.defer();
    var self = this;

    if (this.libraryContent.length == 0) {
        this.load().then(function(data) {
            if (data[tintId]) deferrer.resolve(data[tintId]);
            else deferrer.reject(new Error('Unable to find the tint with id ' + tintId, 'not-found-error'));
        }, function(error) {
            deferrer.reject(error);
        });
    } else {
        if (self.libraryContent[tintId]) deferrer.resolve(self.libraryContent[tintId]);
        else deferrer.reject(new Error('Unable to find the tint with id ' + tintId, 'not-found-error'));
    }

    return deferrer.promise;
};

/**
 * List the tints currently inside the library.
 */
Library.prototype.list = function() {
    var deferrer = Q.defer();
    var self = this;

    if (this.libraryContent.length == 0) {
        this.load().then(function(data) {
            deferrer.resolve(data);
        }, function(error) {
            deferrer.reject(error);
        });
    } else {
        deferrer.resolve(self.libraryContent);
    }

    return deferrer.promise;
};

Library.prototype.add = function(tintUri) {
    var deferrer = Q.defer();
    var self = this;

    rest.get(tintUri + '/raw/master/.meta/manifest.yml')
        .on('complete', function(result) {
            if (result instanceof Error) {
                deferrer.reject(result);
            } else {
                // -- parse the result as being a yaml file
                var tint = yaml.safeLoad(result);

                // -- add the repository url to the tint. We don't want to encode that one into the manifest since
                // -- that would potentially give us contradicting data (different actual URL from what the manifest
                // -- says)
                tint.uri = tintUri;

                if (self.libraryContent[tint.id]) {
                    deferrer.reject(new Error("There is already a tint in the library with the same tint id (" + tint.id + ")"));
                } else {
                    self.libraryContent[tint.id] = tint;

                    self.persist().then(function() {
                        deferrer.resolve(tint);
                        winston.log('info', "A new tint has been added: " + tintUri);

                    }, function(error) {
                        deferrer.reject(error);
                        winston.log('error', error);
                    });

                }
            }
    });

    return deferrer.promise;
};

Library.prototype.remove = function(tintId) {
    delete this.libraryContent[tintId];
    return this.persist();
};

/**
 * Load the library content from persistent storage.
 */
Library.prototype.load = function() {
    var deferrer = Q.defer();
    var self = this;

    var readFile = Q.denodeify(fs.readFile);
    readFile(self.tintRepoConfigFile, 'utf8').done(function(text) {
        try {
            self.libraryContent = yaml.safeLoad(text);

            deferrer.resolve(self.libraryContent);
        } catch (err) {
            deferrer.reject(err);
        }
    });

    return deferrer.promise;
};

/**
 * Persist the library content to persistent storage.
 */
Library.prototype.persist = function() {
    var writeFile = Q.denodeify(fs.writeFile);

    return writeFile(this.tintRepoConfigFile, yaml.safeDump(this.libraryContent));
};

module.exports = Library;
