var winston = require('winston'),
    API = require('../../utils/api-utils');

module.exports = {
    Resource: require('./resource'),
    Service: require('./service'),
    prepare: function(settings, services) { },
    io: function(socket, services) {
        services.task.on('task:started', function(data) {
            socket.emit('task:started', data);
        });

        services.task.on('task:finished', function(data) {
            socket.emit('task:finished', data);
        });

        services.task.on('task:failed', function(data) {
            socket.emit('task:failed', data);
        });

        services.task.on('task:busy', function(data) {
            socket.emit('task:busy', data.data);
        });
    },
    link: function(app, services) {
        var resource = new this.Resource(services.task);

        API.registerGet(app, '/api/v1/tasks', function(req, res) { return resource.listTasks(req, res); });

        API.registerPost(app, '/api/v1/tasks/:code', function(req, res) { return resource.invokeTask(req, res); });
        API.registerGet(app, '/api/v1/tasks/current', function(req, res) { return resource.getCurrent(req, res); });

        API.registerGet(app, '/api/v1/tasks/:code/attempts', function(req, res) { return resource.listAttempts(req, res); });
        API.registerGet(app, '/api/v1/tasks/:code/attempts/:attempt/output', function(req, res) { return resource.attemptOutput(req, res); });
        API.registerGet(app, '/api/v1/tasks/:code/attempts/:attempt/error', function(req, res) { return resource.attemptError(req, res); });
        API.registerDelete(app, '/api/v1/tasks/:code/attempts/:attempt', function(req, res) { return resource.removeAttempt(req, res); });
        API.registerDelete(app, '/api/v1/tasks/:code/attempts', function(req, res) { return resource.removeAttempts(req, res); });
    }
};