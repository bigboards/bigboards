/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    params = require('express-params'),
    Routes = require('./routes'),
    http = require('http'),
    os = require('os'),
    path = require('path'),
    serverConfig = require('./config'),
    Container = require('./container'),
    winston = require('winston'),
    Serfer = require('serfer/src/'),
    Q = require('q'),
    mdns = require('mdns');

var self = this;
var app = express();
var server = http.createServer(app);
params.extend(app);

var io = require('socket.io').listen(server);
var serfer = new Serfer();

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
var hexConfig = null;
var services = null;

    Q.all([
        configuration.load(),
        serfer.connect()
    ]).then(function(config) {
        self.hexConfig = config;

        winston.info('Read the configuration for ' + config.name);

        // -- Create the services
        self.services = createServices(config);

        serfer.stream('*').progress(function(data) {
            if (!data.data || data.data['Name'] != 'metric') return;

            var payload = JSON.parse(data.data['Payload']);
            self.services.metrics.push(payload.node, payload.metric, payload.value);
        });

        server.listen(app.get('port'), function () {
            winston.info('BigBoards-mmc listening on port ' + app.get('port'));
        });
    }).fail(function(error) {
        winston.info('ERR : '  + error);
    });

/**********************************************************************************************************************
 * Handle all exceptions instead of bailing
 *********************************************************************************************************************/
process.on('uncaughtException', function(err) {
    handleError(err);
});

function handleError(error) {
    console.log(JSON.stringify(error));

    if (error.code == 'EADDRINFO')
        return;

    switch (error.errorCode) {
        default:
            throw error;
    }
}

function createServices(config) {
    var services = {};
    services.library = new Container.Library(serverConfig.library.url);
    winston.log('info', 'Create the Library Service');

    services.metrics = new Container.Metrics(serverConfig.metrics.cache.size, serverConfig.metrics.cache.interval);
    winston.log('info', 'Create the Metrics Service');

    services.slots = new Container.Slots(6);
    winston.log('info', 'Create the Slots Service');

    services.tasks = new Container.Tasks();
    winston.log('info', 'Create the Task Service');

    services.tints = new Container.Tints(services.tasks, serverConfig.tints.rootDirectory, serverConfig.address);
    winston.log('info', 'Create the Tint Service');

    services.firmware = new Container.Firmware(serverConfig.firmware.patchesDirectory, services.tasks);
    winston.log('info', 'Create the Firmware Service');

    services.nodes = new Container.Nodes(serfer);
    winston.log('info', 'Create the Node Service');

    //services.health = new Container.Health(services.nodes, services.metrics);
    //winston.log('info', 'Create the Health Service');

    // -- add tasks to the task manager
    services.tasks.register(require('./mods/tasks/update.js'));
    services.tasks.register(require('./mods/tasks/install_tint.js')( configuration ));
    services.tasks.register(require('./mods/tasks/uninstall_tint.js')( configuration ));
    services.tasks.register(require('./mods/tasks/restart_containers.js'));
    services.tasks.register(require('./mods/tasks/dummy.js'));

    /**********************************************************************************************************************
     * Routes
     *********************************************************************************************************************/
    var routes = new Routes(serverConfig, configuration, services);
    routes.link(app, io);

    return services;
}

function advertise(config) {
    try {
        var ad = mdns.createAdvertisement(
            mdns.tcp('bb-master', config.name),
            app.get('port'),
            {
                networkInterface: (os.platform() == 'darwin') ? 'en0' : 'br0'
            }
        );
        ad.on('error', handleMdnsError);
        ad.start();
        winston.info('Advertised the BigBoards Master API using mDNS');
    } catch (ex) {
        handleMdnsError(ex);
    }
}

function handleMdnsError(error) {
    switch (error.errorCode) {
        case mdns.kDNSServiceErr_Unknown:
            console.warn(error);
            setTimeout(advertise, 5000);
            break;
        default:
            throw error;
    }
}
