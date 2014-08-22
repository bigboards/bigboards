var util         = require("util"),
    EventEmitter = require('events').EventEmitter;

function HexNodeManager(serfer) {
    this.serfer = serfer;
}

// -- make sure the metric store inherits from the event emitter
util.inherits(HexNodeManager, EventEmitter);

HexNodeManager.prototype.node = function(nodeName) {
    return this.serfer.membersFiltered(null, null, nodeName);
};

HexNodeManager.prototype.nodes = function() {
    var self = this;
    return this.serfer.members().then(function(members) {
        var result = [];
        members.forEach(function(member) {
            result.push({
                name: member['Name'],
                status: member['Status'],
                tags: member['Tags']
            });
        });

        return result;
    });
};

module.exports = HexNodeManager;
