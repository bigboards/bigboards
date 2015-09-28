var Q = require('q'),
    fsu = require('../../utils/fs-utils'),
    tu = require('../../utils/tint-utils'),
    fs = require('fs'),
    log = require('winston'),
    Errors = require('../../errors');

function SettingsService(settings, config) {
    this.settings = settings;
    this.config = config;
}

/*********************************************************************************************************************
 * Hex
 *********************************************************************************************************************/
SettingsService.prototype.getHexSettings = function() {
    return this.config;
};

/*********************************************************************************************************************
 * Client
 *********************************************************************************************************************/
SettingsService.prototype.getClientSettings = function() {
    return Q({
        id: this.config.hex.id,
        name: this.config.hex.name,
        arch: this.config.hex.arch,
        hive: this.settings.hive,
        firmware: this.settings.firmware,
        version: this.settings.version
    });
};

module.exports = SettingsService;