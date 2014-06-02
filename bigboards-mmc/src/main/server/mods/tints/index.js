var fs = require("fs"),
    Tint = require("./tint.js"),
    Ansible = require("node-ansible"),
    async = require("async"),
    Q = require("q"),
    errors = require("../../errors.js");

function TintManager(taskManager, tintDirectory) {
    this.taskManager = taskManager;
    this.tintDirectory = tintDirectory;
}

/**
 * Get the list of installed tints.
 */
TintManager.prototype.list = function() {

};

/**
 * Get the tint with the given id.
 */
TintManager.prototype.get = function(tintId) {
    return new Tint(tintId, this.tintDirectory + '/' + tintId);
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to install.
 */
TintManager.prototype.install = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('install_tint', {
        tintId: tint.id,
        tintUri: tint.uri
    });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint the tint we want to update
 */
TintManager.prototype.update = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('update_tint', { tintId: tint.id });
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param tint  the tint we want to uninstall.
 */
TintManager.prototype.uninstall = function(tint) {
    if (! tint.uri) throw new errors.IllegalParameterError("Invalid tint format");
    if (! tint.id) throw new errors.IllegalParameterError("Invalid tint format");

    return this.taskManager.invoke('uninstall_tint', { tintId: tint.id });
};

module.exports = TintManager;
