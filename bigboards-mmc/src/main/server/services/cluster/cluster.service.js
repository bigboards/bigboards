var Q = require('q'),
    Consul = require('consul');

var log4js = require('log4js');
var logger = log4js.getLogger('cluster.service');

var consul = new Consul({promisify: true});

function ClusterService() {
    logger.debug("Created the cluster service");
}

/**
 * Get the identity of this cluster.
 */
ClusterService.prototype.get = function() {
    return consul.agent.self()
        .then(function(data) {
            return {
                name: data.Config.Datacenter
            };
        });
};

/**
 * Power off all the nodes of the cluster.
 */
ClusterService.prototype.powerdown = function() {
    // @todo: use ansible to powerdown all the nodes.
};

module.exports = ClusterService;