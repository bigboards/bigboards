app.service('Bootstrap', function($resource) {
    return $resource('/api/v1/bootstrap');
});