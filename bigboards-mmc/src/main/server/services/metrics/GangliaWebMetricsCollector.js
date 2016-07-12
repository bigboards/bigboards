var Q = require('q'),
    unirest = require('unirest');

module.exports.collect = collect;

function collect(MetricsStore, hexName) {
    var promises = [];

    ['cpu', 'load', 'mem', 'network'].forEach(function(report) {
        promises.push(collectReport(hexName, report));
    });

    Q.all(promises).then(function(reports) {
        var current = {};

        reports.forEach(function(reportResult) {
            if (! reportResult) return;

            for (var key in reportResult) {
                if (! reportResult.hasOwnProperty(key)) continue;

                current[key] = reportResult[key];
            }
        });

        return MetricsStore.pushAll('all', current);
    });
}

function collectReport(hexName, report, node) {
    var defer = Q.defer();

    var url = "http://localhost/ganglia/graph.php?r=hour&c=" + hexName + "&s=by+name&mc=2&g=" + report + "_report&json=1";

    if (node) url += ('&h=' + node);

    unirest
        .get(url)
        .end(function (response) {
            if (response.ok) {
                var metrics = {};

                if (response.body && response.body.length > 0) {
                    response.body.forEach(function(metric) {
                        var data = [0, 0];

                        if (metric.datapoints) {
                            for (var idx = metric.datapoints.length - 1; idx > 0; idx--) {
                                data = metric.datapoints[idx];

                                if (data[0] != 'NaN') break;
                            }
                        }

                        metrics[report + '.' + metric.ds_name] = {
                            category: report,
                            name: metric.ds_name,
                            label: metric.metric_name,
                            timestamp: data[1],
                            value: data[0]
                        }
                    });
                }

                defer.resolve(metrics);
            } else defer.reject(new Error(response.raw_body));
        });

    return defer.promise;
}