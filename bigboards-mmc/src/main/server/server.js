/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    cors = require('cors'),
    params = require('express-params'),
    http = require('http'),
    os = require('os'),
    path = require('path'),
    Consul = require('consul');

var log4js = require('log4js');
var logger = log4js.getLogger('server');

var consul = new Consul({promisify: true});

var mmcConfig = require('./config').lookupEnvironment();

consul.agent.self()
    .then(function() {
        startServing(false);
    }, function(error) {
        logger.warn("Going into setup mode since consul could not be reached: " + error.message);
        startServing(true);
    });

process.on('uncaughtException', function(err) {
    handleError(err);
});

function startServing(setupOnly) {
    var app = express();

    params.extend(app);

    var corsOptions = {
        origin: '*',
        methods: 'GET,PUT,POST,PATCH,DELETE'
    };

    app.set('port', mmcConfig.port);
    app.use(cors(corsOptions));

    app.use(express.bodyParser());
    app.use(express.json());

    if (setupOnly) app.use(express.static(path.join(__dirname, '../setup')));
    else app.use(express.static(path.join(__dirname, '../client')));

    app.use(app.router);

    // development only
    if (mmcConfig.is_dev) {
        app.use(express.logger('dev'));
        app.use(express.errorHandler());
    }

    var server = http.createServer(app);
    var io = require('socket.io').listen(server);

    if (setupOnly) {
        require('./services/setup/setup.route')(app, io);

    } else {
        require('./services/nodes/node.route')(app, io);
        require('./services/cluster/cluster.route')(app, io);

    }

    server.listen(app.get('port'), function () {
        logger.info('BigBoards-mmc listening on port ' + app.get('port'));
    });
}

// function initializeServices(mmcConfig, hexConfig, registryStore, consul, app) {
//     var templater = new Templater(hexConfig);
//     logger.info('Service Registration:');
//
//     var services = {};
//
//     services.task = new Services.Task.Service(mmcConfig, hexConfig);
//     Services.Task.link(app, services);
//
//     services.settings = new Services.Settings.Service(mmcConfig, hexConfig);
//     Services.Settings.link(app, services);
//
//     services.cloud = new Services.Hex.Service(mmcConfig, hexConfig, services, consul);
//     Services.Cloud.link(app, services);
//
//     services.hex = new Services.Hex.Service(mmcConfig, hexConfig, templater, services, consul);
//     Services.Hex.link(app, services);
//
//     services.registry = new Services.Registry.Service(mmcConfig, hexConfig, registryStore);
//     Services.Registry.link(app, services);
//
//     services.metrics = new Services.Metrics.Service(mmcConfig, hexConfig);
//     Services.Metrics.link(app, services);
//
//     return services;
// }

function handleError(error) {
    logger.error(error.message);

    if (error.code == 'EADDRINFO')
        return;

    switch (error.errorCode) {
        default:
            logger.error(error.stack);
    }
}