function HexHealthManager(nodes, metrics) {
    this.nodes = nodes;
    this.metrics = metrics;

    // -- every second we will check for health issues
    var self = this;
    setInterval(function() { self.checkNodeAvailability() }, 333);
}

/**
 * Go through all nodes inside the hex and check if they are still available.
 */
HexHealthManager.prototype.checkNodeAvailability = function() {
    var self = this;

    // -- iterate all node names
    for (var nodeName in this.nodes.nodes) {
        // -- get the actual node from the node manager
        var hexNode = self.nodes.node(nodeName);
        if (!hexNode) continue;

        // -- check when the last metric was received from this node
        var avail = (!self.metrics.hasRecentMetrics(nodeName)) ? 'bad' : 'good';

        if (!self.nodes.node(nodeName).health)
            self.nodes.node(nodeName).health = {};

        self.nodes.node(nodeName).health['availability'] = avail;

    }
};

module.exports = HexHealthManager;


