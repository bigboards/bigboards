var os = require('os'),
    fs = require('fs');

module.exports = {
    port: 7099,

    hex: {
        file: '/etc/ansible/facts.d/hex.fact',
        _file: 'src/test/hex.facts'
    },

    targetUrl: '',
    delay: 2000,
    host: os.hostname()
};

