var async = require('async'),
    uuid = require('node-uuid');

function SocketAPI(config, tasks, metricService, nodeService, healthService) {
    this.config = config;
    this.tasks = tasks;
    this.metricService = metricService;
    this.nodeService = nodeService;
    this.healthService = healthService;
}

SocketAPI.prototype.link = function(socket) {
    var self = this;

    linkTasks(socket, this.tasks);
    linkNodes(socket, this.nodeService);
    linkMetrics(socket, this.metricService);
};

function linkTasks(socket, tasks) {
    tasks.on('task:started', function(data) {
        socket.emit('task:started', {
            code: data.code,
            description: data.description,
            type: data.type,
            running: data.running
        });
    });

    tasks.on('task:finished', function(data) {
        socket.emit('task:finished', data);
    });

    tasks.on('task:failed', function(data) {
        socket.emit('task:failed', data);
    });

    tasks.on('task:busy', function(data) {
        socket.emit('task:busy', data.data);
    });
}

function linkMetrics(socket, metricService) {
    socket.on('connection', function() {
        socket.emit('metrics', metricService.current());
    });

    metricService.on('metrics', function(data) {
        socket.emit('metrics', data);
    });
}

function linkNodes(socket, nodeService) {
    nodeService.on('nodes:attached', function(data) {
        socket.emit('nodes:attached', data);
    });

    nodeService.on('nodes:detached', function(data) {
        socket.emit('nodes:detached', data);
    });
}

module.exports = SocketAPI;