var LibraryAPI = require('./library-api'),
    MetricAPI = require('./metrics-api'),
    SocketAPI = require('./socket'),
    SlotsAPI = require('./slots-api'),
    TasksAPI = require('./tasks-api'),
    TintsAPI = require('./tints-api'),
    IdentityAPI = require('./identity-api'),
    FirmwareAPI = require('./firmware-api'),

    winston = require('winston');

function Routes(serverConfiguration, configuration, firmware, library, metrics, nodes, slots, tasks, tints) {
    this.metricAPI = new MetricAPI(metrics, nodes, slots);
    this.socketAPI = new SocketAPI(serverConfiguration, tasks, metrics, slots);
    this.tintsAPI = new TintsAPI(tints, library);
    this.tasksAPI = new TasksAPI(tasks);
    this.libraryAPI = new LibraryAPI(library);
    this.identityAPI = new IdentityAPI(configuration);
    this.slotsAPI = new SlotsAPI(slots);
    this.firmwareAPI = new FirmwareAPI(firmware);
}

Routes.prototype.link = function(server, io) {
    var self = this;

    linkIdentityApi(this, server);
    linkFirmwareAPI(this, server);
    linkMetricApi(this, server);
    linkTaskApi(this, server);
    linkLibraryApi(this, server);
    linkTintApi(this, server);
    linkSlotsApi(this, server);

    // -- Initialize Socket.io communication
    io.sockets.on('connection', function(socket) { self.socketAPI.link(socket) });
};

function linkFirmwareAPI(self, server) {
    server.post('/api/v1/firmware', function(req, res) { self.firmwareAPI.update(req, res); });

    winston.log('info', 'linked the firmware API');
}

function linkIdentityApi(self, server) {
    server.get('/api/v1/identity', function(req, res) { self.identityAPI.get(req, res); });

    winston.log('info', 'linked the identity API');
}

function linkMetricApi(self, server) {
    server.post('/api/v1/metrics', function(req, res) { self.metricAPI.post(req, res); });

    winston.log('info', 'linked the metric API');
}

function linkTaskApi(self, server) {
    server.get('/api/v1/tasks', function(req, res) { self.tasksAPI.get(req, res); });

    winston.log('info', 'linked the tasks API');
}

function linkLibraryApi(self, server) {
    server.get('/api/v1/library', function(req, res) { self.libraryAPI.list(req, res); });
    server.post('/api/v1/library', function(req, res) { self.libraryAPI.post(req, res); });

    winston.log('info', 'linked the library API');
}

function linkSlotsApi(self, server) {
    server.get('/api/v1/slots', function(req, res) { self.slotsAPI.list(req, res); });

    winston.log('info', 'linked the slots API');
}

function linkTintApi(self, server) {
    server.get('/api/v1/tints', function(req, res) { self.tintsAPI.list(req, res); });
    server.post('/api/v1/tints', function(req, res) { self.tintsAPI.install(req, res); });

    server.get('/api/v1/tints/:tint', function(req, res) { self.tintsAPI.get(req, res); });
    server.post('/api/v1/tints/:tintId', function(req, res) { self.tintsAPI.update(req, res); });
    server.delete('/api/v1/tints/:tintId', function(req, res) { self.tintsAPI.uninstall(req, res); });

    server.get('/api/v1/tints/:tint/config', function(req, res) { self.tintsAPI.config(req, res); });

    winston.log('info', 'linked the tint API');
}

module.exports = Routes;
