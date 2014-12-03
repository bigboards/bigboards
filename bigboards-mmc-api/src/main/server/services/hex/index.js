var winston = require('winston'),
    API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    link: function(app, services) {
        var resource = new this.Resource(services.hex);

        API.registerGet(app, '/api/v1/hex', function(req, res) { return resource.get(req, res); });

        // -- Nodes
        API.registerGet(app, '/api/v1/hex/nodes', function(req, res) { return resource.listNodes(req, res); });

        // -- Stack Tints
        API.registerGet(app, '/api/v1/hex/stacks', function(req, res) { return resource.listStacks(req, res); });
        API.registerPost(app, '/api/v1/hex/stacks', function(req, res) { return resource.installStack(req, res); });
        API.registerGet(app, '/api/v1/hex/stacks/:owner/:tintId', function(req, res) { return resource.getStack(req, res); });
        API.registerDelete(app, '/api/v1/hex/stacks/:owner/:tintId', function(req, res) { return resource.removeStack(req, res); });
        //
        //// -- Dataset Tints
        //API.registerGet(app, '/api/v1/hex/datasets', function(req, res) { return resource.listDatasets(req, res); });
        //API.registerPost(app, '/api/v1/hex/datasets', function(req, res) { return resource.installDataset(req, res); });
        //API.registerGet(app, '/api/v1/hex/datasets/:owner/:tintId', function(req, res) { return resource.getDataset(req, res); });
        //API.registerDelete(app, '/api/v1/hex/datasets/:owner/:tintId', function(req, res) { return resource.removeDataset(req, res); });
        //
        //// -- Tutor Tints
        //API.registerGet(app, '/api/v1/hex/tutors', function(req, res) { return resource.listTutors(req, res); });
        //API.registerPost(app, '/api/v1/hex/tutors', function(req, res) { return resource.installTutor(req, res); });
        //API.registerGet(app, '/api/v1/hex/tutors/:owner/:tintId', function(req, res) { return resource.getTutor(req, res); });
        //API.registerDelete(app, '/api/v1/hex/tutors/:owner/:tintId', function(req, res) { return resource.removeTutor(req, res); });
    }
};