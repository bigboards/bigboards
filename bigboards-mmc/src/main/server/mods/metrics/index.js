var TimeSeriesClock = require('./../../utils/time-series-clock');
var arrays = require('./../../utils/arrays');

var util         = require("util");
var EventEmitter = require('events').EventEmitter;

function MetricStore(cacheSize, cacheInterval) {
    var self = this;

    this.metrics_cache = new TimeSeriesClock(cacheSize, cacheInterval);
    this.metrics_hex = new Array(cacheSize);

    this.metrics_cache.on("tick", function(position) {
        var previous_position = self.metrics_cache.previousPosition(position);

        // -- aggregate the metrics
        self.metrics_hex[position] = undefined;
        self._totalMetricsHex(previous_position);

        // -- emit the last position of the hex metrics
        self.emit('metrics:hex', self.metrics_hex[position]);
    });

}

// -- make sure the metric store inherits from the event emitter
util.inherits(MetricStore, EventEmitter);

MetricStore.prototype.push = function(metrics, cb) {
    try {
        this.metrics_cache.push(metrics.node, metrics);

        return cb(null, metrics);
    }
    catch (e) {
        return cb(e);
    }
};

MetricStore.prototype.list = function(cb) {
    try {
        return cb(null, this.metrics_cache.all());
    }
    catch (e) {
        return cb(e);
    }
};

MetricStore.prototype.get = function(cat, size, cb) {
    try {
        if (!cat) {
            return cb(new TypeError("Parameter 'cat' can not be null to get specific metrics!"));
        }

        return this._metricsForHex(size, cb);
    } catch (e) {
        return cb(e);
    }
};

MetricStore.prototype.hasMetrics = function (node_name) {
    return this.metrics_cache.contains(node_name);

};

MetricStore.prototype.hasRecentMetrics = function (node_name) {
    return this.metrics_cache.containsRecent(node_name);

};

MetricStore.prototype.start = function() {
    this.metrics_cache.start();
};

MetricStore.prototype.stop = function() {
    this.metrics_cache.stop();
};


MetricStore.prototype._metricsForHex = function(size, cb) {
    try {
        var l = (size == undefined) ? this.metrics_cache.size - 1 : size;
        var b = this.metrics_cache.size - l;
        var result = new Array(l);

        for (var i = 0; i < l; i++) {
            var p = this.metrics_cache.logicalPosition(b + i);
            result[i] = this.metrics_hex[p];
        }

        return cb(null, result);
    }
    catch (e) {
        return cb(e);
    }
};

MetricStore.prototype._timestampMetricsHex = function(metrics, value) {
    if (value.timestamp == undefined || value.timestamp <= metrics.metrics.timestamp) {
        value.timestamp = metrics.metrics.timestamp;
    }
};

MetricStore.prototype._cpuMetricsHex = function(metrics, value) {
    if (! metrics.metrics.cpus) return;

    var l = metrics.metrics.cpus.length;
    for (var i = 0; i < l; i++) {
        var cpu = metrics.metrics.cpus[i];

        for (var type in cpu.times) {
            if (!value.cpu.hasOwnProperty(type)) {
                value.cpu[type] = 0;
            }

            value.cpu[type] += cpu.times[type];
        }
    }
};

MetricStore.prototype._memoryMetricsHex = function(metrics, value) {
    value.memory.used += metrics.metrics.memory.used;
    value.memory.total += metrics.metrics.memory.total;
};

MetricStore.prototype._diskMetricsHex = function(metrics, value) {
    value.disk.used = metrics.metrics.disk.used;
    value.disk.total = metrics.metrics.disk.total;
};

MetricStore.prototype._totalMetricsHex = function(position) {
    var value = {
        timestamp: '',
        cpu: { total: 0, idle: 0 },
        memory: { total: 0, used: 0 },
        disk: { total: 0, used: 0 },
        network: { total: 0, used: 0 }
    };

    for (var nodeName in this.metrics_cache.keys()) {
        var metrics = this.metrics_cache.value(nodeName, position);

        if (metrics != undefined) {
            this._timestampMetricsHex(metrics, value);
            this._cpuMetricsHex(metrics, value);
            this._memoryMetricsHex(metrics, value);
            this._diskMetricsHex(metrics, value);
        }
    }

    this.metrics_hex[position] = value;
    //console.log('metrics_hex[' + position + '] = ' + JSON.stringify(metrics_hex[position]));
};

module.exports = MetricStore;

