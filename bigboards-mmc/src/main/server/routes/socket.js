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
        socket.emit('metrics:load', metricService.last('load', 'hex'));
        socket.emit('metrics:temperature', metricService.last('temperature', 'hex'));
        socket.emit('metrics:memory', metricService.last('memory', 'hex'));
        socket.emit('metrics:osDisk', metricService.last('osDisk', 'hex'));
        socket.emit('metrics:dataDisk', metricService.last('dataDisk', 'hex'));
    });

    metricService.on('metrics:load', function(data) {
        socket.emit('metrics:load', data);
    });

    metricService.on('metrics:temperature', function(data) {
        socket.emit('metrics:temperature', data);
    });

    metricService.on('metrics:memory', function(data) {
        socket.emit('metrics:memory', data);
    });

    metricService.on('metrics:osDisk', function(data) {
        socket.emit('metrics:osDisk', data);
    });

    metricService.on('metrics:dataDisk', function(data) {
        socket.emit('metrics:dataDisk', data);
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