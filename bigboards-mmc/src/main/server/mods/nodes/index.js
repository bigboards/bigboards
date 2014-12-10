var util         = require("util"),
    EventEmitter = require('events').EventEmitter,
    Q            = require('q');

function HexNodeManager(serf) {
    this.serf = serf;
    this.nodeCache = [];

    var self = this;

    this.serf.members().then(function(members) {
        self.nodeCache = members;
    });

    var serfMemberHandler = this.serf.stream('member-join,member-leave,member-update');
    serfMemberHandler.on('data', function(data) {
        if (!data || !data.data || !data.data.Members) return;

        self.nodeCache = data.data.Members;
    });
}

// -- make sure the metric store inherits from the event emitter
util.inherits(HexNodeManager, EventEmitter);

HexNodeManager.prototype.node = function(nodeName) {
    var idx = indexForNodeName(this.nodeCache, nodeName);

    return (idx == -1) ? null : this.nodeCache[idx];
};

HexNodeManager.prototype.nodes = function() {
    return this.nodeCache;
};

module.exports = HexNodeManager;

function indexForNodeName(nodeList, nodeName) {
    // -- discover the index of the node
    for (var idx in nodeList) {
        if (nodeName == nodeList[idx].name) {
            return idx;
        }
    }

    return -1;
}
