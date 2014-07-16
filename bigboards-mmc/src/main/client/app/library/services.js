libraryModule.service('Library', function($resource) {
    return $resource('/api/v1/library/:tintId', {tintId: '@tintId'}, {
        'sync': { method: 'POST', isArray: true}
    });
});
