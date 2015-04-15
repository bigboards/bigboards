var os = require('os');

module.exports = {
    lookupEnvironment: function() {
        if (os.platform() === 'linux') {
            console.log('Loading Production Settings');
            return this.environments.production;
        } else {
            console.log('Loading Development Settings');
            return this.environments.development;
        }
    },
    environments: {
        development: {
            is_dev: true,
            is_prod: false,
            port: 3010,
            elasticsearch: {
                host: 'localhost:9200',
                log: 'debug',
                apiVersion: '1.1'
            }
        },
        production: {
            is_dev: false,
            is_prod: true,
            port: 3010,
            elasticsearch: {
                host: 'localhost:9200',
                log: 'debug',
                apiVersion: '1.1'
            }
        }
    }
};