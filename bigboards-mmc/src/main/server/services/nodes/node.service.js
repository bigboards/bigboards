var Q = require('q'),
    Consul = require('consul');

var log4js = require('log4js');
var logger = log4js.getLogger('node.service');

var consul = new Consul({promisify: true});

function NodeService() {
    logger.debug("Created the node service");
}

/**
 * List the nodes in this cluster.
 */
NodeService.prototype.list = function() {
    return consul.catalog.node.list()
        .then(function(members) {
            return members.map(function(member) {
                return {
                    name: member.Node,
                    address: member.Address,
                    network: member.TaggedAddresses
                };
            });
        });
};

NodeService.prototype.getMasterNode = function() {
    return consul.status.leader()
        .then(function(data) {
            return data.data.split(':')[0];
        });
};

module.exports = NodeService;