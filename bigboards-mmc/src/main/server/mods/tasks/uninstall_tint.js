var Ansible = require('../ansible/index.js'),
    Lxc = require('../lxc/index.js'),
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

            var flow = [];

            winston.log('info', 'determining the flow of functions to invoke');
            flow.push(function(callback) {
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
            });
            winston.log('info', 'added the executor for removing the tint');

            if (scope.tintType == 'stack') {
                // -- Stop the containers
                flow.push(function(callback) {
                    Lxc.stopContainers().then(function() {
                        callback();
                    }).fail(function(error) {
                        callback(error)
                    });
                });
                winston.log('info', 'added the executor for stopping the containers');

                // -- Destroy the containers
                flow.push(function(callback) {
                    Lxc.destroyContainers().then(function() {
                        callback();
                    }).fail(function(error) {
                        callback(error)
                    });
                });
                winston.log('info', 'added the executor for destroying the containers');
            }

            async.series(flow, function(error) {
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
