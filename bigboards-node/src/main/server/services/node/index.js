var os = require('os'),
    diskspace = require('diskspace'),
    fs = require('fs'),
    Q = require('q');

function Node() { }

Node.prototype.name = function() {
    return Q(os.hostname());
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

module.exports = Node;
