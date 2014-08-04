var Q = require('q');

function NodeAPI(nodeService) {
    this.nodeService = nodeService;
}

NodeAPI.prototype.get = function(req, res) {
    var self = this;
    var result = {};

    Q.all([
        function() { return self.nodeService.name().then(function(data) { result.name = data; }); },
        function() { return self.nodeService.uptime().then(function(data) { result.uptime = data; }); },
        function() { return self.nodeService.load().then(function(data) { result.load = data; }); },
        function() { return self.nodeService.memory().then(function(data) { result.memory = data; }); },
        function() { return self.nodeService.temperature().then(function(data) { result.temperature = data; }); },
        function() { return self.nodeService.osDisk().then(function(data) { result.osDisk = data; }); },
        function() { return self.nodeService.dataDisk().then(function(data) { result.dataDisk = data; }); }
    ]).done(function() {
        return res.json(200, result);
    }).fail(function(error) {
        return res.send(500, error);
    });
};

module.exports = NodeAPI;
