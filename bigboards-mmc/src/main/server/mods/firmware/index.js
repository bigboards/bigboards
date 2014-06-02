var Firmware = function(tasks) {
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

module.exports = Firmware;
