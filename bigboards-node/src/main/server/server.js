var express = require('express'),
    http = require('http'),
    path = require('path'),
    serverConfig = require('./config'),
    Routes = require('./routes'),
    Configuration = require('./services/configuration'),
    winston = require('winston'),
    mdns = require('mdns'),
    Q = require('q');

var app = module.exports = express();
var server = http.createServer(app);
var self = this;

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

/**********************************************************************************************************************
 * Services
 *********************************************************************************************************************/
var configuration = new Configuration(serverConfig.hex.file);

var nodeService = require('./services/node')();
var postman = require('./services/postman')(serverConfig.delay, function(callback) {
    return function () {
        var result = {};
        return Q.all([
            function() { return self.nodeService.name().then(function(data) { result.name = data; }); },
            function() { return self.nodeService.uptime().then(function(data) { result.uptime = data; }); },
            function() { return self.nodeService.load().then(function(data) { result.load = data; }); },
            function() { return self.nodeService.memory().then(function(data) { result.memory = data; }); },
            function() { return self.nodeService.temperature().then(function(data) { result.temperature = data; }); },
            function() { return self.nodeService.osDisk().then(function(data) { result.osDisk = data; }); },
            function() { return self.nodeService.dataDisk().then(function(data) { result.dataDisk = data; }); }
        ]).then(function() { return result; });
    }
});

/**********************************************************************************************************************
 * Routes
 *********************************************************************************************************************/
var routes = new Routes(nodeService);
routes.link(app);

/**********************************************************************************************************************
 * Start Server
 *********************************************************************************************************************/
server.listen(app.get('port'), function () {
    winston.info('BigBoards-node listening on port ' + app.get('port'));

    configuration.load().then(function (config) {
        // -- advertise ourselves
        advertise(config);

        // -- start browsing for masters
        browse(config);
    });
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

function browse(config) {
    var browser = mdns.createBrowser(mdns.tcp('http', 'bb-master', config.id));

    browser.on('serviceUp', function(service) {
        self.postman.startDelivery(
            'http://' + service.host + ':' + service.port + '/api/v1/metrics'
        );
    });

    browser.on('serviceDown', function(service) {
        self.postman.stopDelivery();
    });

    browser.start();
    winston.info('Started browsing for masters');
}

function advertise(config) {
    try {
        var ad = mdns.createAdvertisement(mdns.tcp('http', 'bb-node', config.id), app.get('port'));
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
