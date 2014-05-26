var HexAPI = require('./hex-api'),
    BootstrapAPI = require('./bootstrap-api'),
    MetricAPI = require('./metrics-api'),
    TintsAPI = require('./tints-api'),
    SocketAPI = require('./socket'),
    TasksAPI = require('./tasks-api'),
    LibraryAPI = require('./library-api');

function Routes(config, hex, metricStore, library) {
    this.bootstrapAPI = new BootstrapAPI(hex);
    this.hexAPI = new HexAPI(hex);
    this.metricAPI = new MetricAPI(hex);
    this.socketAPI = new SocketAPI(config, hex, metricStore);
    this.tintsAPI = new TintsAPI(hex, library);
    this.tasksAPI = new TasksAPI(hex);
    this.libraryAPI = new LibraryAPI(library);
}

module.exports = Routes;
