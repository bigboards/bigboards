var Q = require('q'),
    fs = require('fs'),
    log = require('winston'),
    Errors = require('../../errors');

function SettingsService(mmcConfig, hexConfig) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;
}

/*********************************************************************************************************************
 * Hex
 *********************************************************************************************************************/
SettingsService.prototype.getHexSettings = function() {
    return this.hexConfig;
};

/*********************************************************************************************************************
 * Client
 *********************************************************************************************************************/
SettingsService.prototype.getClientSettings = function() {
    return Q({
        id: this.hexConfig.get('id'),
        name: this.config.get('name'),
        arch: this.config.get('arch'),
        hive: this.mmcConfig.hive,
        firmware: this.mmcConfig.firmware,
        version: this.mmcConfig.version
    });
};

module.exports = SettingsService;