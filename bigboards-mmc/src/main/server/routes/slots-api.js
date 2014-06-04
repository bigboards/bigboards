var ApiUtils = require('../utils/api-utils.js');

function SlotsAPI(slots) {
    this.slots = slots;
}

SlotsAPI.prototype.list = function(req, res) {
    try {
        res.send(200, this.slots.list());
    } catch (error) {
        ApiUtils.handleError(res, error);
    }
};

module.exports = SlotsAPI;
