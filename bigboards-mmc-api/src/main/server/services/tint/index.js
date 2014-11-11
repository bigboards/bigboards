module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    link: function(app, services) {
        var resource = new this.Resource(services.tint);

        app.get('/api/v1/tints/:owner/:tint', function(req, res) { return resource.getTint(req, res); });


        app.delete('/api/v1/tints', function(req, res) { return resource.list(req, res); });
    }
};