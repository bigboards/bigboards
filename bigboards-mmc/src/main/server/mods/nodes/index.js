var util         = require("util"),
    EventEmitter = require('events').EventEmitter,
    mdns         = require('mdns');

function HexNodeManager(hexName) {
    this.nodes = {};

    var self = this;
    var browser = mdns.createBrowser(mdns.tcp('bb-node', hexName));

    browser.on('serviceUp', function(service) {
        if (self.nodes[service.name]) return;

        self.nodes[service.name] = {
            name: service.name,
            host: service.host,
            port: service.port,
            addresses: service.addresses
        };

        self.emit('nodes:attached', self.nodes[service.name]);
    });

    browser.on('serviceDown', function(service) {
        if (!self.nodes[service.name]) return;

        var node = self.nodes[service.name];
        delete self.nodes[service.name];
        self.emit('nodes:detached', node);
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
