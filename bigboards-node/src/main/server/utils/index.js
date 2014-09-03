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
    ipAddress: function(itfName, family, internal) {
        if (!family) family = 'IPv4';
        if (internal === null) internal = false;

        var defer = Q.defer();

        var interfaces = os.networkInterfaces();
        if (interfaces) {
            var itf = interfaces[itfName];

            if (! itf) defer.resolve();
            else {
                for (var address in itf) {
                    if (! address.family == family) continue;
                    if (address.internal != internal) continue;

                    defer.resolve(address.address);
                }
            }
        }

        return defer.promise;
    }
};
