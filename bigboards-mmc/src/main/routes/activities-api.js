var Activities = require('../mods/activities.js');

module.exports.list = function(req, res) {
    var length = req.param('length');
    if (! length) return res.send(400, "No length has been provided");

    return Activities.list(function(err, activities) {
        if (err) return res.send(500, err);

        return res.send(activities);
    });
};