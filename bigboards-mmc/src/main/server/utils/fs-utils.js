var Q = require('q'),
    fs = require('fs');

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