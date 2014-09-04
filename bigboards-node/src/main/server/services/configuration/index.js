var fs = require("fs"),
    Q = require('q'),
    winston = require('winston');

function HexConfigurationManager(hexConfigFile) {
    this.hexConfigFile = hexConfigFile;
}

HexConfigurationManager.prototype.load = function() {
    var deferred = Q.defer();

    fs.readFile(this.hexConfigFile, {encoding: 'utf8'}, function(err, data) {
        if (err) return deferred.reject(err);

        try {
            return deferred.resolve(JSON.parse(data));
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

HexConfigurationManager.prototype.save = function(hex) {
    var deferrer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    // -- validate the data we want to write
    if (!hex || !hex.id || !hex.name)
        throw new Error('Invalid configuration object!');

    try {
        var content = JSON.stringify(hex);

        writeFile(this.hexConfigFile, content).then(function(data) {
            deferrer.resolve();
        }).fail(function(error) {
            deferrer.reject(error);
        });
    } catch (error) {
        deferrer.reject(error);
    }

    return deferrer.promise;
};

module.exports = HexConfigurationManager;