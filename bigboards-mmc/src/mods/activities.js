var config = require('./../config');
var FFiFo = require('./../utils/fixed-fifo');
var arrays = require('./../utils/arrays');

var activityCache = new FFiFo(config.activities.cache.size);

module.exports.list = function(size, cb) {
    cb(null, arrays.toArray(activityCache.last(size)));
};

module.exports.add = function(level, type, status, message, data) {
    activityCache.push({
        level: level,
        type: type,
        status: status,
        message: message,
        data: data
    });
};
