var fs = require("fs"),
    yaml = require("js-yaml");

function HexConfigurationManager(hex, hexConfigFile) {
    this.hex = hex;
    this.hexConfigFile = hexConfigFile;
}

HexConfigurationManager.prototype.load = function() {
    var configuration = yaml.safeLoad(fs.readFileSync(this.hexConfigFile, 'utf8'));
    if (! configuration) return;

    this.hex.id = configuration.id;
    this.hex.name = configuration.name;
    this.hex.initialized = configuration.initialized;

    if (configuration.tint) this.hex.tint = this.hex.tintManager.load(configuration.tint);
};

HexConfigurationManager.prototype.save = function() {
    fs.writeFileSync(this.hexConfigFile, yaml.safeDump({
        'id': this.hex.id,
        'name': this.hex.name,
        'initialized': this.hex.initialized,
        'tint': this.hex.tint.id
    }));
};

module.exports = HexConfigurationManager;
