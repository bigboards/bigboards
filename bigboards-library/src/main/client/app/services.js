app.factory('Library', function($resource) {
    return $resource('http://localhost:7007/library.json');
});