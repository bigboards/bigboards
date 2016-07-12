var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function MetricsResource(metricsService, serf) {
    this.metricsService = metricsService;
    this.serf = serf;
}

MetricsResource.prototype.last = function(req, res) {
    if (req.params.hasOwnProperty('node')) {
        return ApiUtils.handlePromise(res, this.metricsService.last(req.params['node']));
    } else {
        return ApiUtils.handlePromise(res, this.metricsService.last());
    }
};

MetricsResource.prototype.getClusterReport = function(req, res) {
    return ApiUtils.handlePromise(res, this.metricsService.getReport(req.params['report'], req.query['range'] | 'hour'));
};

MetricsResource.prototype.getNodeReport = function(req, res) {
    return ApiUtils.handlePromise(res, this.metricsService.getReport(req.params['report'], req.query['range'] | 'hour', req.params['node']));
};

module.exports = MetricsResource;
