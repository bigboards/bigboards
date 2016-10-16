var os = require('os'),
    fs = require('fs');

var log4js = require('log4js');
var logger = log4js.getLogger('server');

var config = null;
if (process.env.BB_ENVIRONMENT) {
    logger.info('Loading ' + process.env.BB_ENVIRONMENT + ' Settings');
    config = require('./' + process.env.BB_ENVIRONMENT + '.config.js');
} else {
    logger.info('Loading Production Settings');
    config = require('./production.config.js');
}

config.app = getApplicationDetails();
config.firmware = "v2.0";
config.version = config.app.version;
config.host = os.hostname();

module.exports = config;

function getApplicationDetails() {
    if (! fs.exists('./package.json')) {
        return {};
    } else {
        var app = require('./package.json');

        return {
            name: app.name,
            description: app.description,
            version: app.version
        };
    }
}