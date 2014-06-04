var ApiUtils = require('../utils/api-utils.js');

function FirmwareAPI(firmware) {
    this.firmware = firmware
}

FirmwareAPI.prototype.update = function(req, res) {
    return this.firmware.update()
        .then(function(data) { res.send(200, data);})
        .fail(function (error) { ApiUtils.handleError(res, error); })
        .done();
};

module.exports = FirmwareAPI;
