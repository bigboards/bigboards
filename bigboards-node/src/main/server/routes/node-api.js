var Q = require('q');

function NodeAPI(nodeService) {
    this.nodeService = nodeService;
}

NodeAPI.prototype.get = function(req, res) {
    var self = this;
    var result = {
        name: null,
        network: {
            externalIp: null,
            internalIp: null
        },
        container: null
    };

    Q.all([
        self.nodeService.name().then(function(data) {
            result.name = data;
        }),
        self.nodeService.externalIpAddress().then(function(data) { result.network.externalIp = data; }),
        self.nodeService.internalIpAddress().then(function(data) { result.network.internalIp = data; }),
        self.nodeService.container().then(function(data) {
            result.container = data;
        })
    ]).then(function() {
        return res.json(200, result);
    }).fail(function(error) {
        return res.send(500, error.message);
    });
};

module.exports = NodeAPI;
