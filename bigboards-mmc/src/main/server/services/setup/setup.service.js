var Q = require('q'),
    unirest = require('unirest');

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
        .get('http://api.hive.bigboards.io:8080/api/v1/cluster/exists')
        .query({ name: name })
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
 *  Ansible is being used to complete these actions.
 *
 * @param name      the name for the cluster
 * @param shortId   the short id of the hive user
 */
SetupService.prototype.setup = function(name, shortId) {

};

/**
 * Exit the setup mode.
 *
 *  Exiting setup mode means we need to restart our process. Ansible is used to complete this action
 */
SetupService.prototype.exit = function() {

};

module.exports = SetupService;