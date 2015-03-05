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
            dir: {
                root: '/opt/bb',
                tints: 'src/test/tints.d',
                tasks: '/var/log/bigboards/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: 'src/test/'
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
            dir: {
                root: '/opt/bb',
                tints: '/opt/bb/tints.d',
                tasks: '/var/log/bigboards/tasks',
                patches: '/opt/bb/runtimes/bigboards-updater/patches',
                facts: '/etc/ansible/facts.d/'
            },
            url: {
                library: 'http://library.bigboards.io'
            }
        }
    }
};

function getExternalIp() {
    var nics = os.networkInterfaces();
    var result = null;

    var interfaces = [ 'wlan0', 'eth0', 'en0', 'br0' ];
    interfaces.forEach(function(itf) {
        // -- return if we already found an item
        if (result) return;

        // -- get the addresses for the nic
        var addresses = nics[itf];
        if (! addresses) return;

        // -- find the first ipv4 address
        addresses.forEach(function(address) {
            // -- return if we already found an item
            if (result) return;

            // -- for some reason this could happen. Don't exactly know why yet.
            if (! address) return;

            // -- we are only interested in IPv4 addresses
            if (address['family'] != 'IPv4') return;

            result = address['address'];
        })
    });

    // -- print a nice message
    if (result) console.info("Using " + result + " as the external ip address");
    else console.warn("No external ip address found");

    return result;
}
