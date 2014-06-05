var fs = require("fs"),
    yaml = require("js-yaml"),
    Q = require('q'),
    winston = require('winston');

function HexConfigurationManager(hexConfigFile) {
    this.hexConfigFile = hexConfigFile;
}

HexConfigurationManager.prototype.load = function() {
    var deferrer = Q.defer();

    var readFile = Q.denodeify(fs.readFile);

    readFile(this.hexConfigFile, {encoding: 'utf8'}).then(function(data) {
        try {
            var config = yaml.safeLoad(data);

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
    var deferrer = Q.defer();
    var writeFile = Q.denodeify(fs.writeFile);

    try {
        var content = yaml.safeDump(hex);

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