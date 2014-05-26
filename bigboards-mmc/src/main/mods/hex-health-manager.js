function HexHealthManager(hex) {
    this.hex = hex;

    var self = this;

    // -- every second we will check for health issues
    setInterval(function() { self.checkNodeAvailability() }, 1000);
}

/**
 * Go through all nodes inside the hex and check if they are still available.
 */
HexHealthManager.prototype.checkNodeAvailability = function() {
    var self = this;

    // -- iterate all node names
    for (var nodeName in this.hex.nodeManager.nodes) {
        // -- get the actual node from the node manager
        var hexNode = self.hex.nodeManager.node(nodeName);
        if (!hexNode) continue;

        // -- check when the last metric was received from this node
        if (!self.hex.metricStore.hasRecentMetrics(nodeName)) {
            hexNode.updateHealth('availability', 'bad');
        } else {
            hexNode.updateHealth('availability', 'good');
        }
    }
};

module.exports = HexHealthManager;


