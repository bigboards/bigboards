var Q = require('q'),
    fs = require('fs'),
    Errors = require('../../errors'),
    https = require('https'),
    auth0 =  require('../../auth0'),
    unirest = require('unirest'),
    util = require("util"),
    EventEmitter = require('events').EventEmitter,
    TimeSeriesClock = require('../../utils/simple-time-series-clock'),
    GangliaMetricsCollector = require('./GangliaWebMetricsCollector');

function MetricsService(mmcConfig, hexConfig) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;

    this.tsc = new TimeSeriesClock(60, 5000);
    this.tsc.on('tick', function() {
        var last = self.tsc.last();
        self.emit('metrics', last);
    });
    this.tsc.start();

    var self = this;
    setInterval(function() {
        GangliaMetricsCollector.collect(self, self.hexConfig.get('name'))
    }, 1000);
}

util.inherits(MetricsService, EventEmitter);

MetricsService.prototype.pushAll = function(node, metrics) {
    var current = this.tsc.current(node);

    if (! metrics) return;

    for (var key in metrics) {
        if (! metrics.hasOwnProperty(key)) continue;

        current[key] = metrics[key];
    }

    this.tsc.push(node, current);

    return Q();
};

MetricsService.prototype.last = function(node) {
    if (! node) node = 'all';

    return Q(this.tsc.last(node));
};

MetricsService.prototype.getReport = function(report, range, node) {
    var defer = Q.defer();

    if (!range) range = 'hour';

    if (['cpu', 'load', 'mem', 'network'].indexOf(report) == -1)
        throw new Errors.IllegalParameterError("Unknown report '" + report + "'. Valid reports are 'cpu', 'load', 'mem' or 'network'.");

    if (['hour', 'day', 'week', 'month'].indexOf(range) == -1)
        throw new Errors.IllegalParameterError("Unknown range '" + range + "'. Valid reports are 'hour', 'day', 'week' or 'month'.");

    var url = "http://localhost/ganglia/graph.php?r=" + range + "&c=" + this.hexConfig.get('name') + "&s=by+name&mc=2&g=" + report + "_report&json=1";

    if (node) url += ('&h=' + node);

    unirest
        .get(url)
        .end(function (response) {
            if (response.ok) defer.resolve(response.body);
            else defer.reject(new Error(response.raw_body));
        });

    return defer.promise;
};

module.exports = MetricsService;