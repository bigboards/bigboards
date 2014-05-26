// Module dependencies
var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    yaml = require('js-yaml');

// Our own module dependencies
var appConfig = require('./config.js');
var routes = require('./routes');
var metrics = require('./metrics');
var PostMan = require('./postman');

// Object instances
var nodeConfig = yaml.safeLoad(
    fs.readFileSync('/opt/bb/hex-node.yml', 'utf8')
);

// Schedule the postman to push its metrics every given interval of milliseconds
var postMan = new PostMan(
    'http://' + nodeConfig.master + '/api/v1/metrics',
    appConfig.publication.delay,
    function(callback) {
        metrics.readAllMetrics(function(metrics) {
            callback({
                slot: nodeConfig.slot,
                node: appConfig.host,
                metrics: metrics
            })
    });
});

// Handle all exceptions instead of bailing
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
