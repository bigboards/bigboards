var Q = require('q');
var fs = require("fs");

var Firmware = function(patchesDirectory, tasks) {
    this.patchesDirectory = patchesDirectory;
    this.tasks = tasks;
};

/**
 * Update the firmware to the latest version.
 *
 * @returns {*}
 */
Firmware.prototype.update = function() {
    return this.tasks.invoke('update');
};

/**
 * Lists the known firmware patches.
 *
 * @returns [patch.name]
 */
Firmware.prototype.patches = function() {
    var deferred = Q.defer();

    var dir = this.patchesDirectory;
    fs.readdir(dir, function(err, data) {
        if (err) return deferred.reject(err);

        try {
            return deferred.resolve(data);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

module.exports = Firmware;
