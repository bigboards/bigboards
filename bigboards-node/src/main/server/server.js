var express = require('express'),
    http = require('http'),
    path = require('path'),
    os = require('os'),
    serverConfig = require('./config'),
    Routes = require('./routes'),
    Configuration = require('./services/configuration'),
    Postman = require('./services/postman'),
    NodeService = require('./services/node'),
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

var nodeService = new NodeService();

var postman = new Postman(nodeService, os.hostname(), serverConfig.delay, [
    {metric: 'load', fn: function(nodeService) { return nodeService.load(); }},
    {metric: 'memory', fn: function(nodeService) { return nodeService.memory(); }},
    {metric: 'temperature', fn: function(nodeService) { return nodeService.temperature(); }},
    {metric: 'osDisk', fn: function(nodeService) { return nodeService.osDisk(); }},
    {metric: 'dataDisk', fn: function(nodeService) { return nodeService.dataDisk(); }}
]);

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
        browse(config, postman);
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

function browse(config, postman) {
    var browser = mdns.createBrowser(mdns.tcp('bb-master', config.name));

    browser.on('serviceUp', function(service) {
        console.log('Found a service with ' + JSON.stringify(service));

        postman.startDelivery(
            'http://' + service.host + ':' + service.port + '/api/v1/metrics'
        );
    });

    browser.on('serviceDown', function(service) {
        postman.stopDelivery();
    });

    browser.start();
    winston.info('Started browsing for masters');
}

function advertise(config) {
    try {
        var ad = mdns.createAdvertisement(mdns.tcp('bb-node', config.name), app.get('port'));
        ad.on('error', handleMdnsError);
        ad.start();
        winston.info('Advertised the BigBoards Node API using mDNS');
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
