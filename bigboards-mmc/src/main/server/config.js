var os = require('os');

module.exports = {
    environment: "development",

    port: process.env.PORT || 7000,
    host: os.hostname(),
    address: getExternalIp(),

    metrics: {
        cache: {
            size: 30,
            interval: 5000
        }
    },

    activities: {
        cache: {
            size: 30
        }
    },

    dir: {
        tasks: '/var/log/bigboards/tasks'
    },

    hex: {
        file: '/etc/ansible/facts.d/hex.fact',
        _file: 'src/test/hex.facts',
        rootDirectory: '/opt/bb'
    },

    tints: {
        rootDirectory: "/opt/bb/tints.d"
    },

    firmware: {
        patchesDirectory: "/opt/bb/runtimes/bigboards-updater",
        versionsFile: "/opt/bb/.versions"
    },

    library: {
        url: "http://library.bigboards.io"
    },

    isDevelopment: function () {
        return 'development' == this.environment;
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
