var util         = require("util"),
    EventEmitter = require('events').EventEmitter;

function HexNodeManager() {
    this.nodes = {};
}

// -- make sure the metric store inherits from the event emitter
util.inherits(HexNodeManager, EventEmitter);

/**
 * Attach a node to the hex.
 *
 * @param hexNode   the node to attach
 */
HexNodeManager.prototype.attach = function(hexNode) {
    this.nodes[hexNode.name] = hexNode;

    this.emit('nodes:attached', hexNode);
};

/**
 * Detach a node from the hex.
 *
 * @param hexNode   the node to detach
 */
HexNodeManager.prototype.detach = function(hexNode) {
    /**
     * This can potentially cause problems if the passed in nodes slot and name couple doesn't match any of the
     * existing nodes. In this case only the node or the node name mapping will be removed.
     */
    delete this.nodes[hexNode.name];

    this.emit('nodes:detached', hexNode);
};

/**
 * Retrieve the node with the given name.
 *
 * @param name  the name of the node
 * @returns {null}
 */
HexNodeManager.prototype.node = function(name) {
    return this.nodes[name];
};

HexNodeManager.prototype.hasNodeWithName = function(name) {
    return (this.nodes[name] != null);
};

/**
 * Get the names of all available nodes.
 */
HexNodeManager.prototype.names = function() {
    var result = [];

    for (var key in this.nodes) {
        result.push(key);
    }

    return result;
};

module.exports = HexNodeManager;
