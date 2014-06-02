var LibraryAPI = require('./library-api'),
    MetricAPI = require('./metrics-api'),
    SocketAPI = require('./socket'),
    TasksAPI = require('./tasks-api'),
    TintsAPI = require('./tints-api'),

    winston = require('winston');

function Routes(config, library, metrics, nodes, slots, tasks, tints) {
    this.metricAPI = new MetricAPI(metrics, nodes);
    this.socketAPI = new SocketAPI(config, tasks, metrics, slots);
    this.tintsAPI = new TintsAPI(tints, library);
    this.tasksAPI = new TasksAPI(tasks);
    this.libraryAPI = new LibraryAPI(library);
}

Routes.prototype.link = function(server, io) {
    var self = this;

    linkMetricApi(server);
    linkTaskApi(server);
    linkLibraryApi(server);
    linkTintApi(server);

    // -- Initialize Socket.io communication
    io.sockets.on('connection', function(socket) { self.socketAPI.link(socket) });
};

function linkMetricApi(server) {
    server.post('/api/v1/metrics', function(req, res) { self.metricAPI.post(req, res); });

    winston.log('info', 'linked the metric API');
}

function linkTaskApi(server) {
    server.get('/api/v1/tasks', function(req, res) { self.tasksAPI.get(req, res); });

    winston.log('info', 'linked the tasks API');
}

function linkLibraryApi(server) {
    server.get('/api/v1/library', function(req, res) { self.libraryAPI.list(req, res); });
    server.post('/api/v1/library', function(req, res) { self.libraryAPI.post(req, res); });
    server.delete('/api/v1/library/:tintId', function(req, res) { self.libraryAPI.remove(req, res); });

    winston.log('info', 'linked the library API');
}

function linkTintApi(server) {
    server.get('/api/v1/tints', function(req, res) { self.tintsAPI.list(req, res); });
    server.post('/api/v1/tints', function(req, res) { self.tintsAPI.install(req, res); });

    server.get('/api/v1/tints/:tint', function(req, res) { self.tintsAPI.get(req, res); });
    server.post('/api/v1/tints/:tintId', function(req, res) { self.tintsAPI.update(req, res); });
    server.delete('/api/v1/tints/:tintId', function(req, res) { self.tintsAPI.uninstall(req, res); });

    winston.log('info', 'linked the tint API');
}

module.exports = Routes;
