var os = require('os'),
    diskspace = require('diskspace'),
    fs = require('fs'),
    Q = require('q'),
    utils = require('../../utils'),
    exec = require('child_process').exec;

function Node(hexName, sequence, internalInterfaceName, externalInterfaceName) {
    this.hexName = hexName;
    this.sequence = sequence;
    this.internalInterfaceName = internalInterfaceName;
    this.externalInterfaceName = externalInterfaceName;
}

Node.prototype.name = function() {
    return Q(os.hostname());
};

Node.prototype.externalIpAddress = function() {
    return utils.net.ipAddress(this.externalInterfaceName);
};

Node.prototype.internalIpAddress = function() {
    return utils.net.ipAddress(this.internalInterfaceName);
};

Node.prototype.uptime = function() {
    return Q(os.uptime());
};

Node.prototype.load = function() {
    return Q(os.loadavg());
};

Node.prototype.memory = function() {
    return Q({
        "used": os.totalmem() - os.freemem(),
        "free": os.freemem(),
        "total": os.totalmem()
    });
};

Node.prototype.osDisk = function() {
    var defer = Q.defer();

    diskspace.check('/', function (err, total, free, status) {
        defer.resolve({
            "used": total - free,
            "free": free,
            "total": total
        });
    });

    return defer.promise;
};

Node.prototype.dataDisk = function() {
    var defer = Q.defer();

    diskspace.check('/data', function (err, total, free, status) {
        defer.resolve({
            "used": total - free,
            "free": free,
            "total": total
        });
    });

    return defer.promise;
};

Node.prototype.temperature = function() {
    var defer = Q.defer();

    var file = '/sys/class/thermal/thermal_zone0/temp';

    fs.exists(file, function(exists) {
        if (exists) {
            fs.readFile('/sys/class/thermal/thermal_zone0/temp', {encoding: 'utf8'}, function (err, data) {
                if (err) return defer.reject(err);

                var value = parseInt(data.substr(0, data.length - 2));

                return defer.resolve(value / 100);
            });
        } else {
            defer.resolve(null);
        }
    });


    return defer.promise;
};

Node.prototype.cpu = function(cpus) {
    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;

    if (cpus != undefined) {
        var l = cpus.length;
        for (var i = 0; i < l; i++) {
            var cpu = cpus[i];
            if (cpu != undefined) {
                user += cpu.times.user;
                nice += cpu.times.nice;
                sys += cpu.times.sys;
                irq += cpu.times.irq;
                idle += cpu.times.idle;
            }
        }
    }

    return Q({
        user: user,
        nice: nice,
        sys: sys,
        irq: irq,
        idle: idle,
        total: user + nice + sys + idle + irq
    });
};

Node.prototype.container = function() {
    var self = this;

    return utils.net
        .interalIpAddress(this.internalInterfaceName)
        .then(function(nodeInternalIp) {
            return getContainerInfo(self.hexName + '-v' + self.sequence, nodeInternalIp);
        });
};

module.exports = Node;

function getContainerInfo(containerName, nodeInternalIp) {
    var defer = Q.defer();

    exec('sudo lxc-info -i -s -n ' + containerName, function(error, stdout, stderr) {
        if (error !== null) {
            defer.reject(error);
            return;
        }

        var result = {
            name: containerName,
            status: null,
            internalIp: null,
            externalIp: null
        };

        var lines = stdout.toString().split('\n');
        lines.forEach(function(line) {
            var lineArray = line.split(':');
            if (lineArray.length != 2) return;

            var value = lineArray[1].trim();

            if (lineArray[0] == 'State') {
                result.status = value;
            } else if (lineArray[0] == 'IP') {
                try {
                    if (sameNetwork(nodeInternalIp, value)) result.internalIp = value;
                    else result.externalIp = value;
                } catch (err) {
                    defer.reject(err);
                }
            }
        });

        defer.resolve(result);
    });

    return defer.promise;
}

function sameNetwork(address1, address2) {
    // -- once we have configurable internal addresses this will probably change. We can use the netmask or ip module
    // -- from npm to make this more efficient.

    if (! address1) return false;
    if (! address2) return false;

    // -- for now we will just check if the first 3 blocks of both addresses are the same
    var arr1 = address1.split('.');
    var arr2 = address2.split('.');

    if (arr1.length != 4) throw new Error('Invalid IP address format!');
    if (arr2.length != 4) throw new Error('Invalid IP address format!');

    for (var i = 0; i < 3; i++)
        if (arr1[i] != arr2[i])
            return false;

    return true;
}