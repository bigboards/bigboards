var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    fsu = require('../../utils/fs-utils');

function HexService(settings, configuration, templater, services) {
    this.settings = settings;
    this.configuration = configuration;
    this.templater = templater;
    this.services = services;
}

HexService.prototype.get = function() {
    return this.configuration.get();
};

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
HexService.prototype.listTints = function(type) {
    var self = this;

    return fsu
        .readDir(this.settings.tints.rootDirectory + '/' + type)
        .then(function(files) {
            var promises = [];

            files.forEach(function(owner) {
                return fsu.readDir(self.settings.tints.rootDirectory + '/' + type + '/' + owner).then(function(tints) {
                    var promises = [];

                    tints.forEach(function(tint) {
                        promises.push(parseManifest(self.services.node, self.templater, self.settings.tints.rootDirectory + '/' + type + '/' + owner + '/' + tint));
                    });

                    return Q.all(promises);
                });
            });

            return Q.all(promises);
        });
};

HexService.prototype.getTint = function(type, owner, tint) {
    return parseManifest(self.services.node, self.templater, self.settings.tints.rootDirectory + '/' + type + '/' + owner + '/' + tint)
};

HexService.prototype.removeTint = function(type, owner, tint) {
    return this.services.task.invoke('tint_uninstall', {
        type: type,
        owner: owner,
        tint: tint
    });
};

HexService.prototype.installTint = function(type, owner, tint, uri) {
    var t = {
        owner: owner,
        tint: tint,
        uri: uri,
        type: type
    };

    return this.taskManager.invoke('tint_install', { tint: t });
};

function parseManifest(nodeService, templater, tintDir) {
    return nodeService
        .nodes()
        .then(function (nodes) {
            return yaml.safeLoad(templater.template(tintDir + "/tint.yml", nodes));
        });
}

module.exports = HexService;