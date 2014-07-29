var os = require('os');

module.exports = {
    environment: "development",

    port: process.env.PORT || 7007,
    host: os.hostname(),

    isDevelopment: function () {
        return 'development' == this.environment;
    }
};