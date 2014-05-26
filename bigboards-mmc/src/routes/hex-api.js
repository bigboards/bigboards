var hex = require('../mods/hex');

function HexAPI() { }

HexAPI.prototype.post = function(req, res) {
    // -- load the hex status
    hex.load();
    var hexStatus = hex.status();

    // -- set the initialized flag
    hexStatus.hex.initialized = true;

    // -- save the settings
    hex.save(hexStatus.hex);
};

module.exports = HexAPI;