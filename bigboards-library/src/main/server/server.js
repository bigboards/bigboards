/**********************************************************************************************************************
 * Module dependencies
 *********************************************************************************************************************/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    serverConfig = require('./config'),
    winston = require('winston'),
    elasticSearch = require('elasticsearch');

var app = module.exports = express();
var server = http.createServer(app);

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

// Start elasticSearch
var es = elasticSearch.Client({host : serverConfig.host + ':' + serverConfig.es_port });

app.get("/library.json", function (req, res) {
    es.search({
        index: 'bigboards',
        type: 'tints',

        // Paging
        from: req.query.from,
        size: req.query.size || 100,

        // Sorting: "field1:asc,field2:desc,..."
        sort: req.query.sort,

        // Basic querying
        q: req.query.q || "*:*"

    }, function(err, response, status) {
        if (err) {
            winston.error(err.message);
            res.json(500, ["We are currently doing some maintenance"]);
            return;
        }

        if (status == 200) {
            res.json(status, response.hits.hits.map(function(document){return document._source;}));
            return;
        }

        res.json(status, [])
    });
});

/**********************************************************************************************************************
 * Start Server
 *********************************************************************************************************************/
server.listen(app.get('port'), function () {
    console.log('bigboards library listening on port ' + app.get('port'));

});
