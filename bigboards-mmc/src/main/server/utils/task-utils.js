var Ansible = require('node-ansible'),
    Q = require('q');

module.exports.runPlaybook = function(playbook, scope, workingDir) {
    var deferred = Q.defer();
    var cwd = '/opt/bb/runtimes/bigboards-mmc/server/ansible';

    if (workingDir) cwd = workingDir;

    var verbose = (scope.verbose && ((scope.verbose == 'yes') || (scope.verbose == 'true')));

    var pb = new Ansible.Playbook()
        .inventory('/opt/bb/hosts')
        .playbook(playbook)
        .variables(scope);

    if (verbose) pb.verbose('vvvv');

    pb.exec({cwd: cwd})
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

module.exports.runShellCommand = function(args, verbose, cwd) {
    var deferred = Q.defer();

    var pb = new Ansible.AdHoc()
        .inventory('/opt/bb/hosts')
        .hosts('host-coordinators')
        .module('shell')
        .asSudo()
        .args(args);

    if (verbose)
        pb.verbose('vvvv');

    pb.exec({cwd: cwd})
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

module.exports.removeFile = function(path, verbose, cwd) {
    var deferred = Q.defer();

    var pb = new Ansible.AdHoc()
        .inventory('/opt/bb/hosts')
        .hosts('host-coordinators')
        .module('file')
        .asSudo()
        .args(args);

    if (verbose)
        pb.verbose('vvvv');

    pb.exec({cwd: cwd})
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
