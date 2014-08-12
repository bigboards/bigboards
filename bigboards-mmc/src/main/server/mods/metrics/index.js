var arrays = require('./../../utils/arrays');

var util         = require("util");
var EventEmitter = require('events').EventEmitter;

function MetricStore(cacheSize, cacheInterval) {
    var self = this;
    this.cacheSize = cacheSize;

    this.metrics = {
        'load': {hex: []},
        'temperature': {hex: []},
        'memory': {hex: []},
        'osDisk': {hex: []},
        'dataDisk': {hex: []}
    };

    this.metricExtractors = {
        'load': function(data) { return data[0]; },
        'temperature': function(data) { return data; },
        'memory': function(data) { return (data.used / data.total) * 100; },
        'osDisk': function(data) { return (data.used / data.total) * 100; },
        'dataDisk': function(data) { return (data.used / data.total) * 100; }
    };

    this.metricRollups = {
        'load': function(dataArray) { return dataArray.reduce(function(prev, cur) { return prev + cur; }) / dataArray.length; },
        'temperature': function(dataArray) { return dataArray.reduce(function(prev, cur) { return prev + cur; }) / dataArray.length; },
        'memory': function(dataArray) { return dataArray.reduce(function(prev, cur) { return prev + cur; }); },
        'osDisk': function(dataArray) { return dataArray.reduce(function(prev, cur) { return prev + cur; }); },
        'dataDisk': function(dataArray) { return dataArray.reduce(function(prev, cur) { return prev + cur; }); }
    };
}

// -- make sure the metric store inherits from the event emitter
util.inherits(MetricStore, EventEmitter);

MetricStore.prototype.push = function(node, metric, value) {
    if (! this.metrics[metric][node])
        this.metrics[metric][node] = [];

    // -- make sure we only show x amount of values
    if (this.metrics[metric][node].length = this.cacheSize)
        this.metrics[metric][node].shift();

    // -- push the value on the metric stack
    this.metrics[metric][node].push(this.metricExtractors[metric](value));

    this.emit('metrics:' + metric, {node: node, value: value});

    // -- time to rollup
    if (node != 'hex') {
        var hexValues = [];
        for (var nodeName in this.metrics[metric]) {
            if (this.metrics[metric].hasOwnProperty(nodeName)) {
                if (nodeName == 'hex') continue;
                if (!this.metrics[metric][nodeName] || this.metrics[metric][nodeName].length == 0) continue;

                hexValues.push(this.metrics[metric][nodeName][this.metrics[metric][nodeName].length - 1]);
            }
        }

        this.push('hex', metric, this.metricRollups[metric](hexValues));
    }
};

MetricStore.prototype.list = function(metric, node) {
    if (!metric) return null;
    if (!node) node = 'hex';

    return this.metrics[metric][node];
};

MetricStore.prototype.last = function(metric, node) {
    if (!metric) return null;
    if (!node) node = 'hex';
    if (!this.metrics[metric][node] || this.metrics[metric][node].length == 0) return null;

    return this.metrics[metric][node][this.metrics[metric][node].length - 1];
};

module.exports = MetricStore;

