var os = require('os'),
    fs = require('fs'),
    yaml = require('js-yaml');

module.exports = {
    publication: { delay: 2000 },
    host: os.hostname()
};

