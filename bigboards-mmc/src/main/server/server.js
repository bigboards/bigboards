/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    Routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    tty = require('tty.js'),
    config = require('./config'),
    Container = require('./container'),
    winston = require('winston');

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
 * Initialize the hex
 *********************************************************************************************************************/
var configuration = new Container.Configuration(config.hex.file);
var firmware = new Container.Firmware();
var library = new Container.Library(config.library.file);
var metrics = new Container.Metrics(config.metrics.cache.size, config.metrics.cache.interval);
var nodes = new Container.Nodes();
var slots = new Container.Slots(6);
var tasks = new Container.Tasks();
var tints = new Container.Tints(tasks, config.tints.rootDirectory);

// -- add tasks to the task manager
tasks.register(require('./mods/tasks/update.js'));
tasks.register(require('./mods/tasks/install_tint.js')( configuration ));
tasks.register(require('./mods/tasks/uninstall_tint.js')( configuration ));
tasks.register(require('./mods/tasks/restart_containers.js'));
tasks.register(require('./mods/tasks/dummy.js'));


/**********************************************************************************************************************
 * Routes
 *********************************************************************************************************************/
var routes = new Routes(config, library, metrics, nodes, slots, tasks, tints);
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
