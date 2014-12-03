var fs = require("fs"),
    Tint = require("./tint.js"),
    async = require("async"),
    Q = require("q"),
    errors = require("../../errors.js"),
    yaml = require("js-yaml"),
    fsu = require('../../utils/fs-utils');

function TintManager(taskService, nodeService, tintDirectory, templater) {
    this.taskManager = taskService;
    this.tintDirectory = tintDirectory;
    this.templater = templater;
    this.nodeService = nodeService;
}

TintManager.prototype.listTints = function(type) {
    var self = this;

    return fsu
        .readDir(this.tintDirectory + '/' + type)
        .then(function(owners) {
            var promises = [];

            for (var o in owners) {
                promises.push(fsu.readDir(self.tintDirectory + '/' + type + '/' + owners[o]).then(function (tints) {
                    var p = [];

                    for (var i in tints) {
                        p.push(parseManifest(this.nodeService, self.templater, self.tintDirectory + '/' + type + '/' + owners[o] + '/' + tints[i]));
                    }

                    return Q.all(p);
                }));
            }

            return Q.all(promises).then(function(responses) {
                var result = [];

                for (var i in responses) {
                    result = result.concat(responses[i]);
                }

                return result;
            });
        });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint      the tint we want to install.
 * @param mapping   the host-to-role mapping for the tint
 */
TintManager.prototype.install = function(tint, mapping) {
    if (! tint) throw new errors.IllegalParameterError("No tint has been given");
    if (! mapping) throw new errors.IllegalParameterError("No host-to-role mapping has been provided");

    return this.taskManager.invoke('stack_install', tint, mapping);
};

/**
 * Uninstall the given tint by passing in its library record.
 *
 * @param tint  the tint we want to uninstall.
 */
TintManager.prototype.uninstall = function(tint) {
    if (! tint) throw new errors.IllegalParameterError("No tint has been given");

    return this.taskManager.invoke('stack_uninstall', tint);
};

function parseManifest(nodeService, templater, tintDir) {
    return nodeService
        .nodes()
        .then(function (nodes) {
            return yaml.safeLoad(templater.template(tintDir + "/tint.yml", nodes));
        }).then(function(tint) {
            tint.mapping = yaml.safeLoad(tintDir + "/mapping.yml");

            return tint;
        });
}

module.exports = TintManager;
