var util         = require("util"),
    EventEmitter = require('events').EventEmitter,
    Restler      = require('restler'),
    Q = require('q');

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
    return this.serfer.members()
        .then(function(members) {
            var result = [];

            var arr = [];
            members.forEach(function(member) { arr.push(nodeDetails(member)); });

            return Q.all(arr);
        })
        .then(function(result) {
            return result.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        });
};

module.exports = HexNodeManager;

function nodeDetails(member) {
    var defer = Q.defer();

    Restler
        .get('http://' + toAddress(member['Addr']).ip + ':7099/api/v1/node')
        .on('complete', function(result) {
            if (result instanceof Error) defer.reject(result);
            else {
                result['tags'] = member['Tags'];
                result['status'] = member['Status'];

                defer.resolve(result);
            }
        });

    return defer.promise;
}

function toAddress(addressBuffer) {
    var l = addressBuffer.length;

    return {
        ip: addressBuffer[l-4] + '.' + addressBuffer[l-3] + '.' + addressBuffer[l-2] + '.' + addressBuffer[l - 1]
    }
}
