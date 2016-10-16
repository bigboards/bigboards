var Q = require('q'),
    unirest = require('unirest'),
    ansible = require('node-ansible'),
    fsUtils = require('../../utils/fs-utils-sync'),
    mmcConfig = require('../../config');

var log4js = require('log4js');
var logger = log4js.getLogger('setup.service');

function SetupService() {
    logger.debug("Created the setup service");
}

/**
 * Validate if the given name was already taken.
 *
 * @param name  the name to validate
 */
SetupService.prototype.validateName = function(name) {
    var defer = Q.defer();

    unirest
        .get(mmcConfig.cloud_api_url + '/v1/cluster/' + name + '/exists')
        .end(function(response) {
            if (response.ok) {
                defer.resolve({ exists: response.body.exists});
            } else {
                defer.reject(new Error(response.body));
            }
        });

    return defer.promise;
};

/**
 * Validate if the given shortId exists.
 *
 * @param shortId  the shortId to validate
 */
SetupService.prototype.validateShortId = function(shortId) {
    var defer = Q.defer();

    unirest
        .get(mmcConfig.cloud_api_url + '/v1/people/' + shortId + '/exists')
        .end(function(response) {
            if (response.ok) {
                defer.resolve(response.body.exists === true);
            } else {
                defer.reject(new Error(response.body));
            }
        });

    return defer.promise;
};

/**
 * Setup the cluster.
 *
 *  This function will undertake the following operations:
 *    - Modify the consul configuration file
 *    - Start the consul service
 *
 *  Ansible is being used to complete these actions on all nodes.
 *
 * @param name      the name for the cluster
 * @param shortId   the short id of the hive user
 * @param nodes     the list of node hostnames
 */
SetupService.prototype.setup = function(name, shortId, nodes) {
    if (!name) throw new Error("No custer name has been defined.");
    if (!shortId) throw new Error("No short ID has been defined.");
    if (!nodes || nodes.length == 0) throw new Error("No nodes have been defined.");

    var content = "[nodes]";

    nodes.foreach(function(node) {
        content += ("\n" + node);
    });

    // -- generate the hosts file
    fsUtils.writeFile("../../../etc/inventory.ansible", content);

    // -- create the playbook
    var playbook = new Ansible.Playbook()
        .inventory("../../../etc/inventory.ansible")
        .playbook('../../ansible/setup/initialize.yml')
        .variables({clusterName: name, shortId: shortId});

    // -- run the playbook
    return playbook.exec({cwd: process.cwd()});
};

/**
 * Exit the setup mode.
 *
 *  Exiting setup mode means we need to restart our process. Ansible is used to complete this action
 */
SetupService.prototype.exit = function() {
    // -- create the playbook
    var playbook = new Ansible.Playbook()
        .inventory("../../../etc/inventory.ansible")
        .playbook('../../ansible/setup/restart-mmc.yml');

    // -- run the playbook
    return playbook.exec({cwd: process.cwd()});
};

module.exports = SetupService;