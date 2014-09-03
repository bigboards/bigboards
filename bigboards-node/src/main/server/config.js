var os = require('os'),
    fs = require('fs');

module.exports = {
    port: 7099,

    hex: {
        file: '/etc/ansible/facts.d/hex.fact',
        _file: 'src/test/hex.facts'
    },

    targetUrl: '',
    delay: 5000,
    host: os.hostname(),
    net: {
        internal: { itf: 'br1' },
        external: { itf: 'br0' }
    }
};

