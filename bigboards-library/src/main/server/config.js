var os = require('os');

module.exports = {
    environment: "development",

    port: process.env.PORT || 7007,
    host: os.hostname(),

    es_port: 9200,

    isDevelopment: function () {
        return 'development' == this.environment;
    }
};