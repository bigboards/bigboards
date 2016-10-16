module.exports = {
    port: process.env.PORT || 7000,
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
    },

    cloud_api_url: 'http://api.hive.bigboards.io/api'
};