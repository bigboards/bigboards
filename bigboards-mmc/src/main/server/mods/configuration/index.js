var fs = require("fs"),
    yaml = require("js-yaml"),
    Q = require('q');

function HexConfigurationManager(hexConfigFile) {
    this.hexConfigFile = hexConfigFile;
}

HexConfigurationManager.prototype.load = function() {
    var deferrer = Q.defer();

    var readFile = Q.denodeify(fs.readFile);

    readFile(this.hexConfigFile).then(function(data) {
        deferrer.resolve(yaml.safeLoad(data));
    });

    return deferrer.promise;
};

HexConfigurationManager.prototype.save = function(hex) {
    var writeFile = Q.denodeify(fs.writeFile);

    return writeFile(this.hexConfigFile, yaml.safeDump(hex));
};

module.exports = HexConfigurationManager;