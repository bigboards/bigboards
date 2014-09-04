var express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    os = require('os'),
    serverConfig = require('./config'),
    Routes = require('./routes'),
    Configuration = require('./services/configuration'),
    Postman = require('./services/postman'),
    NodeService = require('./services/node'),
    Serfer = require('serfer/src/'),
    winston = require('winston');

var app = express();
var server = http.createServer(app);
var serfer = new Serfer();

/**********************************************************************************************************************
 * Configuration
 *********************************************************************************************************************/
app.set('port', serverConfig.port);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use(app.router);

/**********************************************************************************************************************
 * Services
 *********************************************************************************************************************/
var configuration = new Configuration(serverConfig.hex.file);


/**********************************************************************************************************************
 * Start Server
 *********************************************************************************************************************/
serfer.connect()
      .then(function() {return configuration.load()})
      .then(function (config) {
            var nodeService = new NodeService(
                config.name,
                config.node.sequence,
                serverConfig.net.internal.itf,
                serverConfig.net.external.itf
            );

            winston.log('info', 'Internal Network Interface: ' + serverConfig.net.internal.itf);
            winston.log('info', 'Internal Network Address: ' + nodeService.internalIpAddress());
            winston.log('info', 'External Network Interface: ' + serverConfig.net.external.itf);
            winston.log('info', 'External Network Address: ' + nodeService.externalIpAddress());

            var postman = new Postman(nodeService, os.hostname(), serfer, serverConfig.delay, [
                {metric: 'load', fn: function (nodeService) {
                    return nodeService.load();
                }},
                {metric: 'memory', fn: function (nodeService) {
                    return nodeService.memory();
                }},
                {metric: 'temperature', fn: function (nodeService) {
                    return nodeService.temperature();
                }},
                {metric: 'osDisk', fn: function (nodeService) {
                    return nodeService.osDisk();
                }},
                {metric: 'dataDisk', fn: function (nodeService) {
                    return nodeService.dataDisk();
                }}
            ]);

            /**********************************************************************************************************************
             * Routes
             *********************************************************************************************************************/
            var routes = new Routes(nodeService);
            routes.link(app);

            postman.startDelivery();

            server.listen(app.get('port'), function () {
                winston.info('BigBoards-node listening on port ' + app.get('port'));
            });
        });