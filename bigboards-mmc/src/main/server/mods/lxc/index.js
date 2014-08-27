var Ansible = require('../ansible/index.js'),
    Q = require('q'),
    winston = require('winston');

module.exports.initializeContainers = function(scope) {
    var deferred = Q.defer();

    new Ansible.Playbook()
        .inventory('/opt/bb/hosts')
        .playbook('container-init')
        .verbose('vvvv')
        .variables({
            tintId: scope.tintId,
            tintUri: scope.tintUri
        })
        .exec({cwd: '/opt/bb/runtimes/bigboards-mmc/server/ansible'})
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

module.exports.destroyContainers = function(scope) {
    var deferred = Q.defer();

    new Ansible.AdHoc()
        .inventory('/opt/bb/hosts')
        .hosts('host')
        .module('shell')
        .asSudo()
        .args('lxc-destroy -n ' + scope.tintId)
        .exec({cwd: '/opt/bb/tints.d/'})
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

module.exports.stopContainers = function(scope) {
    var deferred = Q.defer();

    new Ansible.AdHoc()
        .inventory('/opt/bb/hosts')
        .hosts('host')
        .module('shell')
        .asSudo()
        .args('lxc-stop -n ' + scope.tintId)
        .exec({cwd: '/opt/bb/tints.d/'})
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