function MetricAPI(metricService, nodeService) {
    this.metricService = metricService;
    this.nodeService = nodeService;
}

/**
 * Post the metrics about a node.
 *
 *  A node will actually be the one posting the metrics. We will not be receiving information from the slot itself.
 *  However, the data that is being sent will contain the slot id to which the node is attached.
 */
MetricAPI.prototype.post = function (req, res) {
    var node = req.param('node');
    if (!node) return res.send(400, 'No node has been provided.');

    var metric = req.param('metric');
    if (!metric) return res.send(400, 'No metric has been provided.');

    console.log(req.body);
    var value = req.body.data;

    this.metricService.push(node, metric, value);

    res.send(200);
};

module.exports = MetricAPI;