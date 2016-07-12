var Q = require('q'),
    fs = require('fs'),
    Errors = require('../../errors'),
    https = require('https'),
    auth0 =  require('../../auth0'),
    unirest = require('unirest');

function MetricsService(mmcConfig, hexConfig) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;
}

MetricsService.prototype.getReport = function(report, range, node) {
    var defer = Q.defer();

    if (!range) range = 'hour';

    if (['cpu', 'load', 'memory', 'network'].indexOf(report) == -1)
        throw new Errors.IllegalParameterError("Unknown report '" + report + "'. Valid reports are 'cpu', 'load', 'memory' or 'network'.");

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