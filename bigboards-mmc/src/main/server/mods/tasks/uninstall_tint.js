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
            },
            {
                key: 'tintType',
                description: 'The type of tint we are uninstalling. Can be stack, edu or data',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(scope) {
            var deferred = Q.defer();

            var flow = [];

            winston.log('info', 'determining the flow of functions to invoke');
            flow.push(function(callback) {
                new Ansible.AdHoc()
                    .inventory('/opt/bb/hosts')
                    .hosts('host-coordinators')
                    .module('file')
                    .asSudo()
                    .args('state=absent path=/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId)
                    .exec({cwd: '/opt/bb/tints.d/' + scope.tintType})
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
                flow.push(function(callback) {
                    Lxc.destroyContainer().then(function() {
                        callback();
                    }).fail(function(error) {
                        callback(error)
                    });
                });
                winston.log('info', 'added the executor for destroying the container');
            }

            async.series(flow, function(error) {
                if (error) {
                    winston.log('error', 'Unable to remove the tint from the hex: ', error);
                    deferred.reject(error);
                } else {
                    winston.log('info', 'Tint ' + scope.tintId + ' successfully uninstalled!');
                    deferred.resolve();
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
