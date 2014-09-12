var Ansible = require('../mods/ansible/index.js'),
    path = require('path'),
    Q = require('q');

module.exports.runPlaybook = function(playbook, scope, workingDir) {
    var deferred = Q.defer();
    var cwd = '/opt/bb/runtimes/bigboards-mmc/server/ansible';
//    var cwd = path.join(__dirname, '../ansible');

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

module.exports.runShellCommand = function(args, verbose, sudo, cwd) {
    var deferred = Q.defer();

    var pb = new Ansible.AdHoc()
        .inventory('/opt/bb/hosts')
        .hosts('host-coordinators')
        .module('shell')
        .args(args);

    if (sudo)
        pb.asSudo();

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
        .args("state=absent path=" + path);

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
