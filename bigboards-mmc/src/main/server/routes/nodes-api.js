function NodesAPI(nodeService) {
    this.nodeService = nodeService;
}

NodesAPI.prototype.get = function (req, res) {
    var nodeName = req.param('nodeName');
    if (! nodeName) return res.send(400, "No Node name has been provided");

    var node = this.nodeService.node(nodeName);

    if (node) res.json(node);
    else res.send(404, 'No node found with name ' + nodeName);
};

NodesAPI.prototype.list = function (req, res) {
    this.nodeService.nodes().then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

module.exports = NodesAPI;