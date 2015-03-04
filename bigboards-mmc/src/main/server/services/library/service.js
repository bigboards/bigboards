var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    request = require('request'),
    fs = require('fs'),
    fsu = require('../../utils/fs-utils'),
    strUtils = require('../../utils/string-utils'),
    Providers = require('./providers');

function LibraryService(settings) {
    this.settings = settings;

    this.populateCache();
}

LibraryService.prototype.persistCache = function() {
    var defer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    try {
        var content = JSON.stringify(this.libraryCache);

        defer.resolve(writeFile(this.settings.dir.tints + '/library_cache.json', content));
    } catch (error) {
        defer.reject(error);
    }

    return defer.promise;
};

LibraryService.prototype.populateCache = function() {
    var self = this;
    var defer = Q.defer();
    var readFile = Q.denodeify(fs.readFile);

    fs.exists(this.settings.dir.tints + '/library_cache.json', function(exists) {
        if (exists) {
            readFile(self.settings.dir.tints + '/library_cache.json', {encoding: 'utf8'}).then(function(data) {
                try {
                    var cache = JSON.parse(data);

                    self.libraryCache = (cache) ? cache : {};

                    defer.resolve(self.libraryCache);
                } catch (error) {
                    defer.reject(error);
                }
            }).fail(function(error) {
                defer.reject(error);
            });
        } else {
            defer.resolve({});
        }
    });

    return defer.promise;
};

LibraryService.prototype.listTintsForType = function(type) {
    if (this.libraryCache) return Q(this.libraryCache[type]);
    else return Q({});
};

LibraryService.prototype.getTint = function(type, owner, slug) {
    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();

    return Q(this.libraryCache[type][strUtils.toTintGUID(owner, slug)]);
};

LibraryService.prototype.addTint = function(url) {
    var self = this;

    var provider = Providers.lookup(url);

    return provider.getDescriptor(url)
        .then(function (descriptor) {
            if (!self.libraryCache) self.libraryCache = {};
            if (!self.libraryCache.hasOwnProperty(descriptor.type)) self.libraryCache[descriptor.type] = {};

            return self.libraryCache[descriptor.type][strUtils.toTintGUID(descriptor.owner.username, descriptor.slug)] = descriptor;
        })
        .then(function() {
            // -- store the cache to disk
            return self.persistCache();
        });
};

LibraryService.prototype.removeTint = function(type, owner, slug) {
    delete this.libraryCache[type][strUtils.toTintGUID(owner, slug)];

    // -- store the cache to disk
    return this.persistCache();
};

module.exports = LibraryService;