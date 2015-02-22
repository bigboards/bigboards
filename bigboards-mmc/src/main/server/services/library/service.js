var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    request = require('request'),
    fs = require('fs'),
    fsu = require('../../utils/fs-utils'),
    Providers = require('./providers');

function LibraryService(settings) {
    this.settings = settings;

    this.libraryCache = this.populateCache();
}

LibraryService.prototype.persistCache = function() {
    var defer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    try {
        var content = JSON.stringify(this.libraryCache);

        defer.resolve(writeFile(this.settings.library.cacheFile, content));
    } catch (error) {
        defer.reject(error);
    }

    return defer.promise;
};

LibraryService.prototype.populateCache = function() {
    var self = this;
    var defer = Q.defer();
    var readFile = Q.denodeify(fs.readFile);

    fs.exists(this.settings.library.cacheFile, function(exists) {
        if (exists) {
            readFile(self.settings.library.cacheFile, {encoding: 'utf8'}).then(function(data) {
                try {
                    self.libraryCache = JSON.parse(data);
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

LibraryService.prototype.refresh = function() {
    var deferrer = Q.defer();
    var self = this;

    request(self.settings.library.url + '/library.json', function(error, response, body) {
        if (error) return deferrer.reject(error);

        var items = JSON.parse(body);

        for (var item in items) {
            if (!items.hasOwnProperty(item)) continue;

            if (! self.libraryCache.hasOwnProperty(item.type))
                self.libraryCache[item.type] = {};

            if (! self.libraryCache[item.type].hasOwnProperty(item.owner.username))
                self.libraryCache[item.type][item.owner.username] = {};

            self.libraryCache[item.type][item.owner.username][item.tint_id] = item;
        }

        return deferrer.resolve(self.persistCache());
    });

    return deferrer.promise;
};

LibraryService.prototype.listTintsForType = function(type) {
    return Q(this.libraryCache[type]);
};

LibraryService.prototype.listTintsForOwner = function(type, owner) {
    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();

    return Q(this.libraryCache[type][owner]);
};

LibraryService.prototype.getTint = function(type, owner, slug) {
    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();
    if (! this.libraryCache[type].hasOwnProperty(owner)) return Q.fail();
    if (! this.libraryCache[type][owner].hasOwnProperty(slug)) return Q.fail();

    return Q(this.libraryCache[type][owner][slug]);
};

LibraryService.prototype.addTint = function(url) {
    var defer = Q.defer();
    var self = this;

    var provider = Providers.lookup(url);

    provider.getDescriptor(url).then(function (descriptor) {
        if (! self.libraryCache.hasOwnProperty(descriptor.type)) self.libraryCache[descriptor.type] = { };
        if (! self.libraryCache[descriptor.type].hasOwnProperty(descriptor.owner.username)) self.libraryCache[descriptor.type][descriptor.owner.username] = { };

        self.libraryCache[descriptor.type][descriptor.owner.username][descriptor.id] = {
            owner: descriptor.owner,
            id: descriptor.id,
            is_private: false,
            name: descriptor.name,
            description: descriptor.description,
            type: descriptor.type,
            logo: descriptor.logo,
            uri: url
        };

        // -- store the cache to disk
        return defer.resolve(self.persistCache());
    });

    return defer.promise;
};

LibraryService.prototype.removeTint = function(type, owner, slug) {
    delete this.libraryCache[type][owner][slug];

    // -- store the cache to disk
    return this.persistCache();
};

module.exports = LibraryService;