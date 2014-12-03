var fs = require("fs"),
    Q = require('q'),
    winston = require('winston');

function HexConfigurationManager(hexConfigFile) {
    this.hexConfigFile = hexConfigFile;
    this.config = null;
}

HexConfigurationManager.prototype.get = function() {
    var self = this;
    if (!this.config) {
        return this.load().then(function(config) {
            self.config = config;
            return self.config;
        })
    } else {
        return Q(self.config);
    }
};

HexConfigurationManager.prototype.load = function() {
    var deferrer = Q.defer();

    var readFile = Q.denodeify(fs.readFile);

    readFile(this.hexConfigFile, {encoding: 'utf8'}).then(function(data) {
        try {
            var config = JSON.parse(data);

            winston.log('info', 'read the configuration file');
            deferrer.resolve(config);
        } catch (error) {
            winston.log('error', 'error while reading the configuration file: ' + error);
            winston.log('error', error.stack);
            deferrer.reject(error);
        }
    }).fail(function(error) {
        deferrer.reject(error);
    });

    return deferrer.promise;
};

HexConfigurationManager.prototype.save = function(hex) {
    var self = this;
    var deferrer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    // -- validate the data we want to write
    if (!hex || !hex.id || !hex.name)
        throw new Error('Invalid configuration object!');

    try {
        var content = JSON.stringify(hex);

        writeFile(this.hexConfigFile, content)
            .then(function(data) {
                self.config = content;
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