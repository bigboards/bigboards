var fsu = require('../utils/fs-utils');

module.exports = {
    port: process.env.PORT || 7000,
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
    },

    cloud_api_url: 'http://api.hive.test.bigboards.io/api'
};
