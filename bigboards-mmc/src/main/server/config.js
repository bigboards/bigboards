var os = require('os'),
    fs = require('fs'),
    fsu = require('./utils/fs-utils');

var log4js = require('log4js');
var logger = log4js.getLogger('server');

module.exports = {
    lookupEnvironment: function() {
        if (process.env.BB_ENVIRONMENT) {
            logger.info('Loading ' + process.env.BB_ENVIRONMENT + ' Settings');
            return this.environments[process.env.BB_ENVIRONMENT];
        } else {
            logger.info('Loading Production Settings');
            return this.environments.production;
        }
    },
    environments: {
        development: {
            app: getApplicationDetails(),
            firmware: "v1.3",
            version: "1.3.0",
            is_dev: true,
            is_prod: false,
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: fsu.absolute('local/root/hosts'),
                registry: fsu.absolute('local/registries.yml'),
                hex: fsu.absolute('local/hex.yml')
            },
            dir: {
                root: fsu.absolute('local/root'),
                tints: fsu.absolute('local/tints.d'),
                tasks: fsu.absolute('src/main/server/ansible'),
                templates: fsu.absolute('src/main/server/templates'),
                tasklogs: fsu.absolute('local/log/tasks'),
                patches: fsu.absolute('/opt/bb/runtimes/bigboards-updater/patches'),
                facts: fsu.absolute('local/facts.d/')
            },
            hive: {
                host: 'localhost',
                port: 8081,
                path: '/api/v1/library'
            },
            docker: {
                registry: 'index.docker.io'
            }
        },
        production: {
            app: getApplicationDetails(),
            firmware: "v1.3",
            version: "1.3.0",
            is_dev: false,
            is_prod: true,
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: '/etc/ansible/hosts',
                registry: '/etc/bigboards/registries.yml',
                hex: '/etc/bigboards/hex.yml'
            },
            dir: {
                root: '/opt/bb',
                tints: '/opt/bb/tints.d',
                tasks: '/opt/bb/runtimes/bigboards-mmc/server/ansible',
                templates: '/opt/bb/runtimes/bigboards-mmc/server/templates',
                tasklogs: '/var/log/bigboards/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: '/etc/ansible/facts.d/'
            },
            hive: {
                host: 'api.hive.bigboards.io',
                port: 80,
                path: '/api/v1/library'
            },
            docker: {
                registry: 'index.docker.io'
            }
        }
    }
};

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