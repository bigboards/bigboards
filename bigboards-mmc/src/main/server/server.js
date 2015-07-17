/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    cors = require('cors'),
    params = require('express-params'),
    http = require('http'),
    os = require('os'),
    path = require('path'),
    Container = require('./container'),
    Services = require('./services'),
    winston = require('winston'),
    Serfer = require('serfer/src/'),
    Q = require('q'),
    Templater = require('./utils/templater');

serverConfig = require('./config').lookupEnvironment();

var serfer = new Serfer();
serfer.connect().then(function() {
    var app = initializeExpress();
    var server = initializeHttpServer(app);

    // -- get the runtime environment
    serverConfig.environment = app.get('env');

    var configuration = new Container.Configuration(serverConfig.dir.facts + 'bb.fact');
    configuration.get().then(function(config) {
        var services = initializeServices(serverConfig, config, serfer, app);

        services.task.registerDefaultTasks(config, services);

        var io = initializeSocketIO(server, services);

        server.listen(app.get('port'), function () {
            winston.info('BigBoards-mmc listening on port ' + app.get('port'));
        });
    });
}).fail(function(error) {
    handleError(error);
});

process.on('uncaughtException', function(err) {
    handleError(err);
});

function initializeHttpServer(app) {
    return http.createServer(app);
}

function initializeExpress() {
    var app = express();

    params.extend(app);

    var corsOptions = {
        origin: '*',
        methods: 'GET,PUT,POST,DELETE'
    };

    app.set('port', serverConfig.port);
    //app.use(function(req, res, next) {
    //    res.header("Access-Control-Allow-Origin", "*");
    //    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //    next();
    //});
    app.use(cors(corsOptions));
    app.use(express.bodyParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, '../client')));
    app.use(app.router);

    // development only
    if (serverConfig.is_dev) {
        app.use(express.logger('dev'));
        app.use(express.errorHandler());
    }

    return app;
}

function initializeSocketIO(server, services) {
    var io = require('socket.io').listen(server);
    //io.set('log level', 1); // reduce logging

    // -- Initialize Socket.io communication
    io.sockets.on('connection', function(socket) {
        Services.Hex.io(socket, services);
        Services.Task.io(socket, services);
        Services.Tutorials.io(socket, services);
    });

    return io;
}

function initializeServices(serverConfig, config, serf, app) {
    var templater = new Templater(config);
    winston.log('info', 'Service Registration:');

    var services = {};

    services.task = new Services.Task.Service(serverConfig);
    Services.Task.link(app, services);

    services.hex = new Services.Hex.Service(serverConfig, config, templater, services, serf);
    Services.Hex.link(app, services);

    services.tutorials = new Services.Tutorials.Service(serverConfig, config, services, templater);
    Services.Tutorials.link(app, services);

    return services;
}

function handleError(error) {
    // TODO must we console-log the message? Or only winston-log it?
//    var msg = JSON.stringify(error);
    console.log(error.message);
    winston.log('error', error.message);

    if (error.code == 'EADDRINFO')
        return;

    switch (error.errorCode) {
        default:
            winston.log('error', error.stack);
    }
}