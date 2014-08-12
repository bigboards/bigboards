function HexHealthManager(nodeService, metricService) {
    this.nodeService = nodeService;
    this.metricService = metricService;

    this.healthCache = {};

    // -- initialize the nodes health
    var nodes = this.nodeService.nodes;
    for (var key in nodes) {
        if (nodes.hasOwnProperty(key)) {
            this.healthCache[key] = -1.0;
        }
    }

    // -- every second we will check for health issues
    var self = this;
    setInterval(function() { self.checkNodeAvailability() }, 333);
}

HexHealthManager.prototype.health = function(nodeName) {
    return this.healthCache[nodeName];
};

/**
 * Go through all nodes inside the hex and check if they are still available.
 */
HexHealthManager.prototype.checkNodeAvailability = function() {
    // -- iterate all node names
    var nodes = this.nodeService.nodes;
    for (var nodeName in nodes) {
        if (nodes.hasOwnProperty(nodeName)) {
            this.healthCache[nodeName] = getHealthiness(nodeName, this.metricService.last('load', nodeName));
        }
    }
};

function getHealthiness(nodeName, metrics) {
    var value = metrics;
    if (! value) return -1.0;

    return 1.0;
}

module.exports = HexHealthManager;


