var Q = require('q');
var fs = require('fs');
var VersionsLiner = require('./versions_liner')

var Firmware = function(patchesDirectory, versionsFile, tasks) {
    this.patchesDirectory = patchesDirectory;
    this.versionsFile = versionsFile;
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
 * List the firmware patches.
 *
 * @returns [{name: versions.name, installedOn: versions.timestamp}]
 */
Firmware.prototype.patches = function() {
    var promises = [];
    promises.push(availablePatches);
    promises.push(installedPatches);

    return availablePatches.call(this);
};

Firmware.prototype.availablePatches = function () {
    var deferred = Q.defer();

    var dir = this.patchesDirectory;
    fs.readdir(dir, function (err, data) {
        if (err) return deferred.reject(err);

        var result = [];
        data.forEach(function (fileName) {
            result.push(Firmware.asPatch(fileName, undefined));
        })

        try {
            return deferred.resolve(result);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    return deferred.promise;
};

Firmware.prototype.installedPatches = function() {
    var deferred = Q.defer();
    var result = [];

    var versionsSource = fs.createReadStream(this.versionsFile);
    var versionsLiner = new VersionsLiner();
    versionsSource.pipe(versionsLiner);

    // On data, append as patch
    versionsLiner.on('readable', function() {
        var line;
        while (line = versionsLiner.read()) {
            result.push(Firmware.lineAsPatch(line));

            try {
                return deferred.resolve(result);
            } catch (ex) {
                return deferred.reject(ex)
            }
        }
    });

    // In case of EOF, return result
    versionsLiner.on('end', function() {
        try {
            return deferred.resolve(result);
        } catch (ex) {
            return deferred.reject(ex)
        }
    });

    // In case of error, return to fail
    versionsSource.on('error', function(error) {
        return deferred.reject(error);
    });
    versionsLiner.on('error', function(error) {
        return deferred.reject(error);
    });

    return deferred.promise;
};

module.exports = Firmware;

Firmware.asPatch = function(name, installedOn) {
    return {name: name, installedOn: installedOn};
};

Firmware.lineAsPatch = function(line) {
    var pipePosition = line.indexOf('|');
    var patchName = pipePosition >= 0 ? line.substring(0, pipePosition).trim() : line;
    var installedOn = pipePosition >= 0 ? line.substring(pipePosition + 1).trim() : undefined

    patchName = patchName == '' ? undefined : patchName;
    installedOn = installedOn == '' ? undefined : installedOn;

    return Firmware.asPatch(patchName, installedOn);
};
