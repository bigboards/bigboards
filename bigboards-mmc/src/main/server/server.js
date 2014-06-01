/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/

var express = require('express'),
    Routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    tty = require('tty.js'),
    config = require('./config'),
    Hex = require('./mods/hex'),
    Library = require('./mods/library'),
    MetricStore = require('./mods/hex-metric-store.js');

var app = module.exports = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1); // reduce logging

config.environment = app.get('env');

/**********************************************************************************************************************
 * Configuration
 *********************************************************************************************************************/
app.set('port', config.port);
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, '../client')));
app.use(app.router);

// development only
if (config.isDevelopment()) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}

/**********************************************************************************************************************
 * Initialize the metric store
 *********************************************************************************************************************/
var metricStore = new MetricStore(
    config.metrics.cache.size,
    config.metrics.cache.interval
);

/**********************************************************************************************************************
 * Initialize the hex
 *********************************************************************************************************************/
var hex = new Hex(
    config.hex.rootDirectory,
    metricStore
);

var library = new Library(
    config.library.file
);

/**********************************************************************************************************************
 * Routes
 *********************************************************************************************************************/
var routes = new Routes(config, hex, metricStore, library);

// -- Initialize the routes for the API to work
app.post('/api/v1/bootstrap', function(req, res) { routes.bootstrapAPI.post(req, res); });

//server.get('/api/v1/library', libraryApi.list);

app.post('/api/v1/metrics', function(req, res) { routes.metricAPI.post(req, res); });

app.get('/api/v1/tasks', function(req, res) { routes.tasksAPI.get(req, res); });

app.get('/api/v1/library', function(req, res) { routes.libraryAPI.list(req, res); });
app.post('/api/v1/library', function(req, res) { routes.libraryAPI.post(req, res); });
app.delete('/api/v1/library/:tintId', function(req, res) { routes.libraryAPI.remove(req, res); });

app.post('/api/v1/tints/:tintId', function(req, res) { routes.tintsAPI.install(req, res); });
app.delete('/api/v1/tints/:tintId', function(req, res) { routes.tintsAPI.uninstall(req, res); });

//app.get('/api/v1/tints/:tint/actions', function(req, res) { routes.tintsAPI.actions(req, res); });
//app.post('/api/v1/tints/:tint/actions/:action', function(req, res) { routes.tintsAPI.invokeAction(req, res); });
//
//app.get('/api/v1/tints/:tint/parameters', function(req, res) { routes.tintsAPI.parameters(req, res); });
//app.get('/api/v1/tints/:tint/config', function(req, res) { routes.tintsAPI.configuration(req, res); });
//app.get('/api/v1/tints/:tint/views', function(req, res) { routes.tintsAPI.views(req, res); });
//app.get('/api/v1/tints', function(req, res) { routes.tintsAPI.get(req, res); });

// -- Initialize Socket.io communication
io.sockets.on('connection', function(socket) { routes.socketAPI.connect(socket) });

/**********************************************************************************************************************
 * Start Server
 *********************************************************************************************************************/
server.listen(app.get('port'), function () {
    console.log('BigBoards-mmc listening on port ' + app.get('port'));

    // -- Start the metrics gatherer
    metricStore.start();
});

/**********************************************************************************************************************
 * TTY Server
 *********************************************************************************************************************/
var ttyServer = tty.createServer({
    shell: 'bash',
    static: path.join(__dirname, 'shell'),
//    users: {
//        foo: 'bar'
//    },
    port: 57575
});

ttyServer.listen();
