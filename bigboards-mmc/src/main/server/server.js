/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    Routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    tty = require('tty.js'),
    serverConfig = require('./config'),
    Container = require('./container'),
    winston = require('winston');

var app = module.exports = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1); // reduce logging

serverConfig.environment = app.get('env');

/**********************************************************************************************************************
 * Configuration
 *********************************************************************************************************************/
app.set('port', serverConfig.port);
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, '../client')));
app.use(app.router);

// development only
if (serverConfig.isDevelopment()) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}

/**********************************************************************************************************************
 * Initialize the hex
 *********************************************************************************************************************/
var configuration = new Container.Configuration(serverConfig.hex.file);
var library = new Container.Library(serverConfig.library.url);
var metrics = new Container.Metrics(serverConfig.metrics.cache.size, serverConfig.metrics.cache.interval);
var nodes = new Container.Nodes();
var slots = new Container.Slots(6);
var tasks = new Container.Tasks();
var tints = new Container.Tints(tasks, serverConfig.tints.rootDirectory, serverConfig.address);
var firmware = new Container.Firmware(tasks);
var health = new Container.Health(nodes, metrics);

// -- add tasks to the task manager
tasks.register(require('./mods/tasks/update.js'));
tasks.register(require('./mods/tasks/install_tint.js')( configuration ));
tasks.register(require('./mods/tasks/uninstall_tint.js')( configuration ));
tasks.register(require('./mods/tasks/restart_containers.js'));
tasks.register(require('./mods/tasks/dummy.js'));

/**********************************************************************************************************************
 * Routes
 *********************************************************************************************************************/
var routes = new Routes(serverConfig, configuration, firmware, library, metrics, nodes, slots, tasks, tints);
routes.link(app, io);

/**********************************************************************************************************************
 * Start Server
 *********************************************************************************************************************/
server.listen(app.get('port'), function () {
    console.log('BigBoards-mmc listening on port ' + app.get('port'));

    // -- Start the metrics gatherer
    metrics.start();
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
