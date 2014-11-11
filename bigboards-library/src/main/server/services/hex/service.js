var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    moment = require('moment'),
    yaml = require("js-yaml"),
    fsu = require('../../utils/fs-utils');

function HexService(settings, configuration, templater, services) {
    this.settings = settings;
    this.configuration = configuration;
    this.templater = templater;
    this.services = services;
}

HexService.prototype.get = function() {
    return this.configuration.load();
};

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
HexService.prototype.listTints = function(type) {
    var self = this;

    return fsu
        .readDir(this.settings.tintDirectory + '/' + type)
        .then(function(files) {
            var promises = [];

            files.forEach(function(owner) {
                return fsu.readDir(self.settings.tintDirectory + '/' + type + '/' + owner).then(function(tints) {
                    var promises = [];

                    tints.forEach(function(tint) {
                        promises.push(parseManifest(self.services.node, self.templater, self.settings.tintDirectory + '/' + type + '/' + owner + '/' + tint));
                    });

                    return Q.all(promises);
                });
            });

            return Q.all(promises);
        });
};

HexService.prototype.getTint = function(type, owner, tint) {
    return parseManifest(self.services.node, self.templater, self.settings.tintDirectory + '/' + type + '/' + owner + '/' + tint)
};

HexService.prototype.removeTint = function(type, owner, tint) {
    return this.services.task.invoke('tint_uninstall', {
        type: type,
        owner: owner,
        tint: tint
    });
};

HexService.prototype.installTint = function(type, owner, tint) {
    return this.services.library.get(type, owner, tint)
        .then(function(tint) {
            return this.taskManager.invoke('tint_install', {
                owner: tint.owner,
                tint: tint.tint,
                uri: tint.uri,
                type: tint.type
            });
        });
};

function parseManifest(nodeService, templater, tintDir) {
    return nodeService
        .nodes()
        .then(function (nodes) {
            return yaml.safeLoad(templater.template(tintDir + "/tint.yml", nodes));
        });
}

module.exports = HexService;