var Ansible = require('../ansible/index.js'),
    Q = require('q'),
    winston = require('winston');

module.exports.initializeContainers = function(scope) {
    var deferred = Q.defer();

    var verbose = false;
    if (scope.verbose) {
        verbose = (scope.verbose == 'yes') || (scope.verbose == 'true');
    }

    var pb = new Ansible.Playbook()
        .inventory('/opt/bb/hosts')
        .playbook('container-init')
        .variables({
            tintId: scope.tintId,
            tintType: scope.tintType,
            tintUri: scope.tintUri
        });

    if (verbose) pb.verbose('vvvv');

    pb.exec({cwd: '/opt/bb/runtimes/bigboards-mmc/server/ansible'})
        .then(function(result) {
            if (result.code != 0) deferred.reject(new Error(result.code));
            else deferred.resolve();
        }, function(error) {
            deferred.reject(error);
        }, function(progress) {
            deferred.notify(progress);
        });

    return deferred.promise;
};