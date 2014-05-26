var fs = require("fs"),
    Tint = require("./tint.js"),
    Ansible = require("node-ansible"),
    async = require("async"),
    Q = require("q"),
    errors = require("../errors.js");

function TintManager(taskManager, tintDirectory) {
    this.taskManager = taskManager;
    this.tintDirectory = tintDirectory;
}

/**
 * Get the current tint.
 */
TintManager.prototype.load = function(tintId) {
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
 * @param libraryRecord the record holding all information about the tint.
 */
TintManager.prototype.update = function(libraryRecord) {
    if (! libraryRecord.uri) throw new Error("Invalid library record format");
    if (! libraryRecord.id) throw new Error("Invalid library record format");

    var self = this;

    return new Ansible.Playbook()
        .inventory('/opt/bb/hosts')
        .playbook('install.yml')
        .exec({cwd: self.tintDirectory + '/' + libraryRecord.id});
};

/**
 * Install the given tint by passing in its library record.
 *
 * @param libraryRecord the record holding all information about the tint.
 */
TintManager.prototype.uninstall = function(libraryRecord) {
    if (! libraryRecord.uri) throw new Error("Invalid library record format");
    if (! libraryRecord.id) throw new Error("Invalid library record format");

    var self = this;

    return new Ansible.Playbook()
        .inventory('/opt/bb/hosts')
        .playbook('uninstall.yml')
        .exec({cwd: self.tintDirectory + '/' + libraryRecord.id})
        .then(removeDirectory(self.tintDirectory + '/' + libraryRecord.id));
};

var removeDirectory = function(directory) {
    var deferred = Q.defer();

    fs.unlink(directory, function(err) {
        if (err) return deferred.reject(err);
        return deferred.resolve();
    });

    return deferred.promise;
};

module.exports = TintManager;
