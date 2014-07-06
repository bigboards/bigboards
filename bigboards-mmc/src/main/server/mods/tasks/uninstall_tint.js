var Ansible = require('../ansible/index.js'),
    Q = require('q'),
    async = require('async'),
    fs = require('fs'),
    winston = require('winston');

module.exports = function(configuration) {
    return {
        code: 'uninstall_tint',
        description: 'removing the tint from the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tintId',
                description: 'The unique id of the tint',
                required: true
            }
        ],
        execute: function(scope) {
            var deferred = Q.defer();

            var outputBuffer = [];

            async.series([
                // -- Remove the tint source from the master node
                function(callback) {
                    new Ansible.AdHoc()
                        .inventory('/opt/bb/hosts')
                        .hosts('host-coordinators')
                        .module('file')
                        .asSudo()
                        .args('state=absent path=/opt/bb/tints.d/' + scope.tintId)
                        .exec({cwd: '/opt/bb/tints.d/'})
                        .then(function(result) {
                            if (result.code != 0) {
                                winston.log('error', 'Unable to remove tint folder from the master node');
                                callback(new Error(result.code));
                            } else {
                                winston.log('info', 'Successfully removed the tint folder from the master node');
                                callback();
                            }
                        }, function(error) {
                            winston.log('error', 'Unable to remove tint folder from the master node:', error);
                            callback(error);
                        }, function(progress) {
                            deferred.notify(progress);
                        });
                },

                // -- Stop the containers
                function(callback) {
                    new Ansible.AdHoc()
                        .inventory('/opt/bb/hosts')
                        .hosts('host')
                        .module('shell')
                        .asSudo()
                        .args('lxc-stop -n ' + scope.tintId)
                        .exec({cwd: '/opt/bb/tints.d/'})
                        .then(function(result) {
                            if (result.code != 0) {
                                winston.log('error', 'Unable to stop the LXC Containers');
                                callback(new Error(result.code));
                            } else {
                                winston.log('info', 'Successfully stopped the LXC Containers');
                                callback();
                            }
                        }, function(error) {
                            winston.log('error', 'Unable to stop LXC Containers: ', error);
                            callback(error);
                        }, function(progress) {
                            deferred.notify(progress);
                        });
                },

                // -- Remove the container from the hex
                function(callback) {
                    new Ansible.AdHoc()
                        .inventory('/opt/bb/hosts')
                        .hosts('host')
                        .module('shell')
                        .asSudo()
                        .args('lxc-destroy -n ' + scope.tintId)
                        .exec({cwd: '/opt/bb/tints.d/'})
                        .then(function(result) {
                            if (result.code != 0) {
                                winston.log('error', 'Unable to remove LXC Container from the nodes');
                                callback(new Error(result.code));
                            } else {
                                winston.log('info', 'Successfully removed the LXC Container from the nodes');
                                callback();
                            }
                        }, function(error) {
                            winston.log('error', 'Unable to remove LXC Container from the nodes: ', error);
                            callback(error);
                        }, function(progress) {
                            deferred.notify(progress);
                        });
                }

            ], function(error) {
                if (error) {
                    winston.log('error', 'Unable to remove the tint from the hex: ', error);
                    deferred.reject(error);
                } else {
                    // -- load the hex information
                    configuration.load().then(function(data) {
                        data.tint = null;

                        configuration.save(data).then(function(data) {
                            winston.log('info', 'Hex configuration saved!');
                            winston.log('info', 'Tint successfully uninstalled!');
                            deferred.resolve();
                        }).fail(function(error) {
                            winston.log('info', 'Unable to save the hex configuration: ', error);
                            deferred.reject(error);
                        });
                    }, function(error) {
                        deferred.reject(error);
                    }, function(progress) {
                        deferred.notify(progress);
                    });
                }
            });

            return deferred.promise;
        }
    };
};

function parseAnsibleOutput(buffer, ansibleOutput) {
    var lines = ansibleOutput.split('\n');

    var currentRole = null;
    var currentStatement = null;

    lines.forEach(function(line) {
        var firstChars = line.substr(0, 4);

        if (firstChars == 'TASK') {
            var pattern = /.*\[(.*)\|(.*)\]/;

            var matches = line.match(pattern);

            currentRole = matches[1];
            currentStatement = matches[2];

        } else if (firstChars == 'ok: ' || firstChars == 'chan' || firstChars == 'fail') {
            var m2 = line.match(/(.*): \[(.*)\].*/);
            buffer.push({
                role: currentRole,
                statement: currentStatement,
                host: m2[2],
                status: m2[1]
            })
        }
    });
}

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
