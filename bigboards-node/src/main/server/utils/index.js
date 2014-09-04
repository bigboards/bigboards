var os = require('os'),
    Q = require('q');

module.exports.text = {
    startsWith: function(str, prefix) {
        return str.slice(0, prefix.length) == prefix;
    }
};

module.exports.net = {
    interalIpAddress: function(internalInterfaceName) {
        return this.ipAddress(internalInterfaceName);
    },
    exteralIpAddress: function(externalInterfaceName) {
        return this.ipAddress(externalInterfaceName);
    },
    ipAddress: function(itfName, family) {
        if (!family) family = 'IPv4';

        var defer = Q.defer();

        var interfaces = os.networkInterfaces();
        if (interfaces) {
            var itf = interfaces[itfName];

            if (! itf) defer.resolve();
            else {
                var addr = null;
                itf.forEach(function(address) {
                    if (address.family != family) return;

                    addr = address.address;
                });

                defer.resolve(addr);
            }
        }

        return defer.promise;
    }
};
