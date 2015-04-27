var Q = require('q'),
    http = require('http'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    request = require('request'),
    fs = require('fs'),
    fsu = require('../../utils/fs-utils'),
    strUtils = require('../../utils/string-utils'),
    Providers = require('./providers');

function LibraryService(settings, services, templater) {
    this.settings = settings;
    this.services = services;
    this.templater = templater;

    this.localLibrary = [];
    this.hiveLibrary = [];

    this.loadLocalLibrary();
    this.loadHiveLibrary();
}

LibraryService.prototype.loadLocalLibrary = function() {
    var self = this;
    var defer = Q.defer();

    fs.exists(this.settings.dir.tints + '/library_cache.json', function(exists) {
        if (exists) {
            fsu.readJsonFile(self.settings.dir.tints + '/library_cache.json')
                .then(function(data) { self.localLibrary = (data) ? data : {}; })
                .fail(function(error) { defer.reject(error); });
        } else {
            defer.resolve({});
        }
    });

    return defer.promise;
};

LibraryService.prototype.loadHiveLibrary = function() {
    var self = this;
    var defer = Q.defer();

    http.get(this.settings.url.hive, function(res) {
        console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

    fs.exists(this.settings.dir.tints + '/library_cache.json', function(exists) {
        if (exists) {
            fsu.readJsonFile(self.settings.dir.tints + '/library_cache.json')
                .then(function(data) { self.localLibrary = (data) ? data : {}; })
                .fail(function(error) { defer.reject(error); });
        } else {
            defer.resolve({});
        }
    });

    return defer.promise;
};

LibraryService.prototype.refresh = function() {
    return Q.all([
        this.loadLocalLibrary(),
        this.loadHiveLibrary()
    ]);
};

LibraryService.prototype.saveLocalLibrary = function() {
    return fsu.jsonFile(this.settings.dir.tints + '/library_cache.json', this.localLibrary);
};

LibraryService.prototype.listTintsForType = function(type) {
    var self = this;

    if (! this.libraryCache) return Q({});

    return this.services.hex.listNodes().then(function(nodes) {
        return self.templater.createScope(nodes).then(function(scope) {
            return Q.all([
                self.templater.templateWithScope(self.localLibrary[type], scope),
                self.templater.templateWithScope(self.hiveLibrary[type], scope)
            ]).then(function (responses) {
                return {
                    local: responses[0],
                    hive: responses[1]
                }
            });
        });
    });
};

LibraryService.prototype.getTint = function(type, owner, slug) {
    var self = this;

    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();

    return this.services.hex.listNodes().then(function(nodes) {
        return self.templater.createScope(nodes).then(function(scope) {
            return self.templater.templateWithScope(self.libraryCache[type][strUtils.toTintGUID(owner, slug)], scope);
        });
    });
};

LibraryService.prototype.addTint = function(url) {
    var self = this;

    var provider = Providers.lookup(url);

    return provider.getDescriptor(url)
        .then(function (descriptor) {
            if (!self.libraryCache) self.libraryCache = {};
            if (!self.libraryCache.hasOwnProperty(descriptor.type)) self.libraryCache[descriptor.type] = {};

            descriptor.uri = url;

            return self.libraryCache[descriptor.type][strUtils.toTintGUID(descriptor.owner.username, descriptor.slug)] = descriptor;
        })
        .then(function() {
            // -- store the cache to disk
            return self.saveLocalLibrary();
        });
};

LibraryService.prototype.removeTint = function(type, owner, slug) {
    delete this.libraryCache[type][strUtils.toTintGUID(owner, slug)];

    // -- store the cache to disk
    return this.saveLocalLibrary();
};

module.exports = LibraryService;
