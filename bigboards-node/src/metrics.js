var os = require('os');
var diskspace = require('diskspace');
var fs = require('fs');

var cpus_last = undefined;

module.exports.readAllMetrics = function(callback) {
    diskspace.check('/', function (osTotal, osFree) {
        diskspace.check('/data', function (dataTotal, dataFree) {
            var cpus = deltaCpus(os.cpus());

            var metrics = {
                timestamp: Date.now(),
                load: os.loadavg(),
		temperature: temp(),
                memory: {
                    total: os.totalmem(),
                    used: os.totalmem() - os.freemem()
                },
                disks: {
                    os: {
                        total: osTotal,
                        used: osTotal - osFree
                    },
                    data: {
                        total: dataTotal,
                        used: dataTotal - dataFree
                    }
                },
                disk: {
                    total: osTotal + dataTotal,
                    used: osTotal + dataTotal - (osFree + dataFree)
                },
                cpus: cpus,
                cpu: totalCpus(cpus),
                interfaces: os.networkInterfaces()
            };

            callback(metrics);
        });
    });
};

function deltaCpus(cpus) {
    if (cpus_last == undefined) {
        cpus_last = cpus;
        return;
    }

    var result = undefined;
    if (cpus != undefined) {
        result = new Array();

        var l = cpus.length;
        for (var i = 0; i < l; i++) {
            var cpu = clone(cpus[i]);
            var cpu_last = cpus_last[i];

            cpu.times.user -= cpu_last.times.user;
            cpu.times.nice -= cpu_last.times.nice;
            cpu.times.sys -= cpu_last.times.sys;
            cpu.times.irq -= cpu_last.times.irq;
            cpu.times.idle -= cpu_last.times.idle;
            cpu.times.total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle;
            result[i] = cpu;
        }

        cpus_last = cpus;
    }

    return result;
}

function totalCpus(cpus) {
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

    return {
        user: user,
        nice: nice,
        sys: sys,
        irq: irq,
        idle: idle,
        total: user + nice + sys + idle + irq
    }
}

function temp() {
    var data = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', {encoding: 'utf8'});
    console.log('temp = ' + data);
    return data;
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
