var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var winston = require('winston');

var Config = require('./config').lookupEnvironment();

/* -- Storage -- */
var storage = require('./storage')(
    new elasticsearch.Client(Config.elasticsearch),
    'bigboards-library'
);

/* -- Services -- */
var Profile = require('./services/profile');

var services = {};
services.Profile = new Profile.Service(storage);

var app = express();
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(errorHandler);

Profile.link(app, services);

app.listen(Config.port, function () {
    winston.info();
    winston.info('BigBoards library listening on port ' + Config.port);
    winston.info();
});
