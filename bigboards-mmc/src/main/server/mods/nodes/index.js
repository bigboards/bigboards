var util         = require("util"),
    EventEmitter = require('events').EventEmitter,
    mdns         = require('mdns');

function HexNodeManager(hexId) {
    this.nodes = {};

    var self = this;
    var browser = mdns.createBrowser(mdns.tcp('http', 'bb-node', hexId));

    browser.on('serviceUp', function(service) {
        self.nodes[service.name] = {
            name: service.name,
            host: service.host,
            port: service.port,
            addresses: service.addresses
        };

        this.emit('nodes:attached', self.nodes[name]);
    });

    browser.on('serviceDown', function(service) {
        var node = self.nodes[name];
        delete self.nodes[service.name];
        this.emit('nodes:detached', node);
    });

    browser.start();
}

// -- make sure the metric store inherits from the event emitter
util.inherits(HexNodeManager, EventEmitter);

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
