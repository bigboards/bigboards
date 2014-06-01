dashboardModule.service('Metrics', function($resource) {
    return $resource('/api/v1/metrics/');
});

dashboardModule.service('Status', function($resource) {
    return $resource('/api/v1/hex/');
});

dashboardModule.service('HexMetrics', function($resource) {
    return $resource('/api/v1/metrics/hex?size=1');
});