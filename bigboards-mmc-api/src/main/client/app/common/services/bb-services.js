app.factory('socket', function (socketFactory, Runtime) {
    return socketFactory({
        ioSocket: io.connect(Runtime.api.url)
    });
});

app.service('Library', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/library/:tintId', {tintId: '@tintId'}, {
        'sync': { method: 'POST', isArray: true}
    });
});

app.service ('Hex', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/hex', {id: '@id'}, {
        'identity': { method: 'GET', isArray: false }
    });
});

app.service ('Nodes', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/hex/nodes', {id: '@id'}, {
        'list': { method: 'GET', isArray: true }
    });
});

app.service ('Stacks', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/hex/stacks/:owner/:tintId', {owner: '@owner', tintId: '@tintId'}, {
        'list': { method: 'GET', isArray: true },
        'install': { method: 'POST'},
        'uninstall': { method: 'DELETE'}
    });
});

app.service ('Datasets', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/hex/datasets/:owner/:tintId', {owner: '@owner', tintId: '@tintId'}, {
        'list': { method: 'GET', isArray: true },
        'install': { method: 'POST'},
        'uninstall': { method: 'DELETE'}
    });
});

app.service ('Tutors', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/hex/tutors/:owner/:tintId', {owner: '@owner', tintId: '@tintId'}, {
        'list': { method: 'GET', isArray: true },
        'install': { method: 'POST'},
        'uninstall': { method: 'DELETE'}
    });
});

app.service('Tasks', function($resource, Runtime) {
    return $resource(Runtime.api.url + '/api/v1/tasks/:code', {code: '@code'}, {
        'invoke': { method: 'POST', isArray: false}
    });
});

app.service('Tint', function($resource, $rootScope, Tints, Runtime) {
    var service = function() {
        this.viewCache = null;
        this.actionCache = null;
        this.configCache = null;
    };

    service.prototype.views = function(cb) {
        var me = this;

        if (! this.viewCache) {
            return Tints.get(
                {tintId: $rootScope.tint.id, category: 'views'},
                function(data) {
                    me.viewCache = data;
                    return cb(me.viewCache);
                },
                function() {
                    me.viewCache = null;
                    return cb(null);
                }
            )
        } else {
            return cb(this.viewCache);
        }
    };

    service.prototype.actions = function(cb) {
        var me = this;

        if (! this.actionCache) {
            return Tints.get(
                {tintId: $rootScope.tint.id, category: 'actions'},
                function(data) {
                    me.actionCache = data;
                    return cb(me.actionCache);
                },
                function() {
                    me.actionCache = null;
                    return cb(null);
                }
            )
        } else {
            return cb(this.viewCache);
        }
    };

    service.prototype.config = function(cb) {
        var me = this;

        if (! this.configCache) {
            return Tints.get(
                {tintId: $rootScope.tint.id, category: 'config'},
                function(data) {
                    me.configCache= data;
                    return cb(me.configCache);
                },
                function() {
                    me.configCache = null;
                    return cb(null);
                }
            )
        } else {
            return cb(this.configCache);
        }
    };


    return new service;
});

app.factory('ApiFeedback', function($rootScope) {
    var ApiFeedback = function ApiFeedback() {};

    ApiFeedback.prototype.onSuccess = function(msg, cb) {
        var self = this;

        return function(data) {
            try {
                // -- perform the callback
                if (cb) cb(data);

                // -- emit the success event
                self.success(msg);
            } catch (e) {
                console.log(e);
                this.error(
                    'Something went wrong while processing the feedback from the backend. The call actually made it ' +
                    'to the backend but the response which was sent back was not processed correctly by your browser. Please refresh the ' +
                    'page to make sure the state of the backend is represented on your screen.'
                );
            }
        };
    };

    ApiFeedback.prototype.onError = function(msgs, cb) {
        var self = this;

        if (!msgs) msgs = {};

        return function(error) {
            try {
                // -- perform the callback
                if (cb) cb(error);

                console.log('HTTP ' + error.status + ':' + error.data);

                if (error.status === 400) { // -- Invalid Request
                    self.danger(
                        'The request has been rejected by the server. This probably means wrong data has been sent to ' +
                        'the server and will most likely be caused by a bug in the software. Please report this on ' +
                        '<a href="http://issues.bigboards.io" target="_blank">the BigBoards issue tracker</a>'
                    );

                } else if (error.status === 403) { // -- Forbidden
                    self.danger(
                        'Access to the given resource is not allowed. If you think this is incorrect please report this on ' +
                        '<a href="http://issues.bigboards.io" target="_blank">the BigBoards issue tracker</a>'
                    );

                } else if (error.status === 404) { // -- Not Found
                    if (msgs['404']) self.danger(msgs['404']);
                    else self.danger('The requested item could not be found.');

                } else if (error.status === 500) { // -- Server Error
                    self.danger(
                        'The request has generated an error on the server. This will most likely be caused by a bug in ' +
                        'the software. Please report this on ' +
                        '<a href="http://issues.bigboards.io" target="_blank">the BigBoards issue tracker</a>'
                    );

                } else if (error.status === 502 || error.status === 503 || error.status === 504) { // -- Not Available
                    self.danger(
                        'The backend is currently not available. The most frequent reason for this is the absence of a ' +
                        ' running bigboards-mmc server. Try to login to your hex and verify there is a bigboards-mmc server ' +
                        ' running.'
                    );

                } else {
                    self.danger(
                        'An error has occurred while processing your request. It is not clear if this is caused by a bug ' +
                        'or by some strange co-incident. Further investigation is needed. Please report this on <a href="http://issues.bigboards.io" target="_blank">the BigBoards issue tracker</a>'
                    );
                }
            } catch (e) {
                self.danger(
                    'Something went wrong while processing the feedback from the backend. The call actually made it ' +
                    'to the backend but the response which was sent back was not processed correctly by your browser. Please refresh the ' +
                    'page to make sure the state of the backend is represented on your screen.'
                );
            }
        }
    };

    ApiFeedback.prototype.success = function(message) {
        $rootScope.$emit({
            level: 'success',
            message: message
        });
    };

    ApiFeedback.prototype.info = function(message) {
        $rootScope.$emit({
            level: 'info',
            message: message
        });
    };

    ApiFeedback.prototype.danger = function(message) {
        console.log(message);
        $rootScope.$emit({
            level: 'danger',
            message: message
        });
    };

    ApiFeedback.prototype.warning = function(message) {
        $rootScope.$emit({
            level: 'warning',
            message: message
        });
    };

    return new ApiFeedback();
});