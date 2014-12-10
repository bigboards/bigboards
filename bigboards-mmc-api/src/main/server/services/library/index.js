module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    io: function(socket, services) {},
    link: function(app, services) {
        var resource = new this.Resource(services.library);

        app.get('/api/v1/library/:type', function(req, res) { return resource.listTintsForType(req, res); });
        app.get('/api/v1/library/:owner', function(req, res) { return resource.listTintsForOwner(req, res); });
        app.get('/api/v1/library/:owner/:tintId', function(req, res) { return resource.getTint(req, res); });
        app.post('/api/v1/library/:owner/:tintId', function(req, res) { return resource.createTint(req, res); });
        app.put('/api/v1/library/:owner/:tintId', function(req, res) { return resource.updateTint(req, res); });
        app.delete('/api/v1/library/:owner/:tintId', function(req, res) { return resource.removeTint(req, res); });
    }
};