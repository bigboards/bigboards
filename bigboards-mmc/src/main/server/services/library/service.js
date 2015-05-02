var Q = require('q'),
    http = require('http'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    request = require('request'),
    fs = require('fs'),
    fsu = require('../../utils/fs-utils'),
    netUtils = require('../../utils/net-utils'),
    sysUtils = require('../../utils/sys-utils'),
    strUtils = require('../../utils/string-utils'),
    Providers = require('./providers');

function LibraryService(settings, services, templater) {
    this.settings = settings;
    this.services = services;
    this.templater = templater;

    this.localLibrary = [];
    this.hiveLibrary = [];

    //this.loadLocalLibrary();
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

    return netUtils.getJson(this.settings.hive.host, this.settings.hive.port, this.settings.hive.path, {
        'BB-Architecture': sysUtils.architecture(),
        'BB-Firmware': this.settings.firmware
    }).then(function(data) {
        self.hiveLibrary = data.data;
    });
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

    return this.services.hex.listNodes().then(function(nodes) {
        var scope = self.templater.createScope(nodes);

        var promises = [];

        var local = self.localLibrary[type];
        if (local && local.length > 0) promises.push(self.templater.templateWithScope(self.localLibrary[type], scope));

        var hive = self.hiveLibrary[type];
        if (hive && hive.length > 0) promises.push(self.templater.templateWithScope(self.hiveLibrary[type], scope));

        return Q.all(promises).then(function (responses) {
            var result = {local: [], hive: []};

            var i = 0;
            if (local && local.length > 0) result.local = responses[i++];
            if (hive && hive.length > 0) result.hive = responses[i];

            return result;
        });
    });
};

LibraryService.prototype.getTint = function(type, owner, slug) {
    var self = this;

    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();

    return this.services.hex.listNodes().then(function(nodes) {
        var scope = self.templater.createScope(nodes);

        return self.templater.templateWithScope(self.libraryCache[type][strUtils.toTintGUID(owner, slug)], scope);
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
