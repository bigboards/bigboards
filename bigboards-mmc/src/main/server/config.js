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
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: 'local/root/hosts'
            },
            dir: {
                root: 'local/root',
                tints: 'local/tints.d',
                tasks: 'src/main/server/ansible',
                tasklogs: 'local/log/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: 'local/facts.d/'
            },
            url: {
                library: 'http://library.bigboards.io'
            }
        },
        production: {
            is_dev: false,
            is_prod: true,
            port: process.env.PORT || 7000,
            host: os.hostname(),
            file: {
                hosts: '/opt/bb/hosts'
            },
            dir: {
                root: '/opt/bb',
                tints: '/opt/bb/tints.d',
                tasks: '/opt/bb/runtimes/bigboards-mmc/server/ansible',
                tasklogs: '/var/log/bigboards/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: '/etc/ansible/facts.d/'
            },
            url: {
                library: 'http://library.bigboards.io'
            }
        }
    }
};
