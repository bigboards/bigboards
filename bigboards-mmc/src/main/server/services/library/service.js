var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    request = require('request'),
    fs = require('fs'),
    fsu = require('../../utils/fs-utils'),
    BitBucket = require('bitbucket-rest');

function LibraryService(settings) {
    this.settings = settings;

    this.bitbucket = BitBucket.connectClient({ username: 'bbio', password: 'vdH0kQbwa1f6'});

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

LibraryService.prototype.getTint = function(type, owner, tintId) {
    if (! this.libraryCache.hasOwnProperty(type)) return Q.fail();
    if (! this.libraryCache[type].hasOwnProperty(owner)) return Q.fail();

    return Q(this.libraryCache[type][owner][tintId]);
};

LibraryService.prototype.createTint = function(type, owner, tintId) {
    var defer = Q.defer();
    var self = this;

    this.bitbucket.getRepoDetails({repo_slug: tintId, owner: owner}, function (res) {
        if (res.status != 200) return defer.reject(res.data.error.message);
        var repository = res.data;

        if (! self.libraryCache.hasOwnProperty(type))
            self.libraryCache[type] = { };

        if (! self.libraryCache[type].hasOwnProperty(owner))
            self.libraryCache[type][owner] = { };

        var descriptionSplits = repository.description.split('\n', 2);

        self.libraryCache[type][owner][tintId] = {
            owner: {username: repository.owner.username, displayName: repository.owner.display_name},
            tint_id: repository.name,
            is_private: repository.is_private,
            logo: repository.links.avatar.href,
            name: (descriptionSplits.length > 0) ? descriptionSplits[0] : null,
            description: (descriptionSplits.length > 1) ? descriptionSplits[1] : null,
            type: 'stack'
        };

        // -- store the cache to disk
        return defer.resolve(self.persistCache());
    });

    return defer.promise;
};

LibraryService.prototype.removeTint = function(type, owner, tintId) {
    delete this.libraryCache[type][owner][tintId];

    // -- store the cache to disk
    return this.persistCache();
};

module.exports = LibraryService;