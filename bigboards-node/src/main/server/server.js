var express = require('express'),
    http = require('http'),
    path = require('path'),
    os = require('os'),
    serverConfig = require('./config'),
    Routes = require('./routes'),
    Configuration = require('./services/configuration'),
    Postman = require('./services/postman'),
    NodeService = require('./services/node'),
    Serfer = require('serfer/src/'),
    winston = require('winston'),
    mdns = require('mdns'),
    Q = require('q');

var app = module.exports = express();
var server = http.createServer(app);
var self = this;
var serfer = new Serfer();

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

var postman = new Postman(nodeService, os.hostname(), serfer, serverConfig.delay, [
    {metric: 'ipAddress', fn: function(nodeService) { return nodeService.ipAddress(); }},
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
serfer.connect().then(function() {
    postman.startDelivery();

    server.listen(app.get('port'), function () {
        winston.info('BigBoards-node listening on port ' + app.get('port'));
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
