var Errors = require('../../errors');

function ProfileService(storage) {
    this.storage = storage;
}

ProfileService.prototype.search = function(queryString, paging) {
    return this.storage.profile.search({ query: { query_string: { query: queryString } } }, paging);
};

ProfileService.prototype.get = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.profile.get(id);
};

ProfileService.prototype.add = function(data) {
    return this.storage.profile.add(data);
};

ProfileService.prototype.update = function(id, data) {
    if (! id)
        throw new Errors.MissingParameterError('No member id has been provided');

    return this.storage.profile.update(id, data);
};

ProfileService.prototype.remove = function(id) {
    if (! id)
        throw new Errors.MissingParameterError('No profile id has been provided');

    return this.storage.profile.remove(id);
};

module.exports = ProfileService;