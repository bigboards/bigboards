var ApiUtils = require('../utils/api-utils.js');

function FirmwareAPI(firmware) {
    this.firmware = firmware
}


/**
 * @api {get} /api/v1/patches Request the list of available patches.
 * @apiName GetPatches
 * @apiGroup Firmware
 *
 * @apiSuccess [{name: versions.name, installedOn: versions.timestamp}] firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
FirmwareAPI.prototype.patches = function(req, res) {
    return this.firmware.patches()
        .then(function(data) {res.send(200, data);})
        .fail(function(error) {ApiUtils.handleError(res, error); })
        .done();
};

/**
 * @api {put} /api/v1/patch/:patch Install the given patch.
 * @apiName InstallPatch
 * @apiGroup Firmware
 *
 * @apiParam {String} patch The id of the patch to install.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
FirmwareAPI.prototype.patch = function(req, res) {
    var patch = req.param('patch');
    return this.firmware.patch(patch)
        .then(function(data) {res.send(200, data);})
        .fail(function(error) {ApiUtils.handleError(res, error); })
        .done();
};

/**
 * @api {post} /api/v1/firmware Update the firmware.
 * @apiName UpdateFirmware
 * @apiGroup Firmware
 */
FirmwareAPI.prototype.update = function(req, res) {
    return this.firmware.update()
        .then(function(data) { res.send(200, data);})
        .fail(function(error) { ApiUtils.handleError(res, error); })
        .done();
};

/**
 * @api {get} /api/v1/firmware Get the current firmware version.
 * @apiName GetFirmware
 * @apiGroup Firmware
 */
FirmwareAPI.prototype.current = function(req, res) {
    return this.firmware.current()
        .then(function(data) { res.send(200, data);})
        .fail(function(error) { ApiUtils.handleError(res, error); })
        .done();
};

module.exports = FirmwareAPI;
