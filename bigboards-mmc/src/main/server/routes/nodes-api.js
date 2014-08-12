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
    res.json(this.nodeService.nodes);
};

module.exports = NodesAPI;