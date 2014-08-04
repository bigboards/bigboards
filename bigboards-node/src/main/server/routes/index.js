var NodeAPI = require('./node-api'),
    winston = require('winston');

function Routes(nodeService) {
    this.nodeService = new NodeAPI(nodeService);
}

Routes.prototype.link = function(server) {
    linkNodeApi(this, server);
};

function linkNodeApi(self, server) {
    server.get('/api/v1/node', function(req, res) { self.nodeService.get(req, res); });

    winston.log('info', 'linked the node API');
}

module.exports = Routes;
