var os = require('os'),
    fsu = require('./utils/fs-utils');

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
            firmware: "feniks-wip",
            is_dev: true,
            is_prod: false,
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: fsu.absolute('local/root/hosts')
            },
            dir: {
                root: fsu.absolute('local/root'),
                tints: fsu.absolute('local/tints.d'),
                tasks: fsu.absolute('src/main/server/ansible'),
                tasklogs: fsu.absolute('local/log/tasks'),
                patches: fsu.absolute('/opt/bb/runtimes/bigboards-updater/patches'),
                facts: fsu.absolute('local/facts.d/')
            },
            hive: {
                host: 'hive.bigboards.io',
                port: 80,
                path: '/api/v1/library'
            },
            docker: {
                registry: 'index.docker.io'
            }
        },
        production: {
            firmware: "gemini",
            is_dev: false,
            is_prod: true,
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: '/etc/ansible/hosts'
            },
            dir: {
                root: '/opt/bb',
                tints: '/opt/bb/tints.d',
                tasks: '/opt/bb/runtimes/bigboards-mmc/server/ansible',
                tasklogs: '/var/log/bigboards/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: '/etc/ansible/facts.d/'
            },
            hive: {
                host: 'hive.bigboards.io',
                port: 80,
                path: '/api/v1/library'
            },
            docker: {
                registry: 'index.docker.io'
            }
        }
    }
};
