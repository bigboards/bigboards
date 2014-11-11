module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    link: function(app, services) {
        var resource = new this.Resource(services.hex);

        app.get('/api/v1/hex/:hex', function(req, res) { return resource.get(req, res); });

        app.get('/api/v1/hex/:hex/stacks', function(req, res) { return resource.listStacks(req, res); });
        app.post('/api/v1/hex/:hex/stacks', function(req, res) { return resource.installStack(req, res); });
        app.get('/api/v1/hex/:hex/stacks/:owner/:tintId', function(req, res) { return resource.getStack(req, res); });
        app.delete('/api/v1/hex/:hex/stacks/:owner/:tintId', function(req, res) { return resource.removeStack(req, res); });

        app.get('/api/v1/hex/:hex/datasets', function(req, res) { return resource.listDatasets(req, res); });
        app.post('/api/v1/hex/:hex/datasets', function(req, res) { return resource.installDatasets(req, res); });
        app.get('/api/v1/hex/:hex/datasets/:owner/:tintId', function(req, res) { return resource.getDataset(req, res); });
        app.delete('/api/v1/hex/:hex/datasets/:owner/:tintId', function(req, res) { return resource.removeDataset(req, res); });

        app.get('/api/v1/hex/:hex/tutors', function(req, res) { return resource.listTutors(req, res); });
        app.post('/api/v1/hex/:hex/tutors', function(req, res) { return resource.installTutors(req, res); });
        app.get('/api/v1/hex/:hex/tutors/:owner/:tintId', function(req, res) { return resource.getTutor(req, res); });
        app.delete('/api/v1/hex/:hex/tutors/:owner/:tintId', function(req, res) { return resource.removeTutor(req, res); });
    }
};