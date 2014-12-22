var Q = require('q'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

module.exports.readFile = function(file) {
    var deferred = Q.defer();

    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
        if (err) return deferred.reject(err);

        try {
            return deferred.resolve(data);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

module.exports.readDir = function(dir) {
    var deferred = Q.defer();

    fs.readdir(dir, function(err, data) {
        if (err) return deferred.reject(err);

        try {
            return deferred.resolve(data);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

module.exports.exists = function(file) {
    var deferred = Q.defer();

    fs.exists(file, function(exists) {
        try {
            return deferred.resolve(exists);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

module.exports.fileName = function(path) {
    if (path) {
        var start = path.lastIndexOf("/")+1;
        var end = path.length;
        return path.substring(start, end);
    }

    return undefined;
};

module.exports.jsonFile = function(path, obj) {
    var defer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    try {
        var content = JSON.stringify(obj);

        defer.resolve(writeFile(path, content));
    } catch (error) {
        defer.reject(error);
    }

    return defer.promise;
};

module.exports.mkdir = function(dir) {
    var deferred = Q.defer();

    mkdirp(dir, function(err, data) {
        if (err) return deferred.reject(err);

        try {
            return deferred.resolve(data);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};