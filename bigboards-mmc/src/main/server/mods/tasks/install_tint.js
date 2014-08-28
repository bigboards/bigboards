var Ansible = require('../ansible/index.js'),
    Lxc = require('../lxc/index.js'),
    Q = require('q'),
    async = require('async'),
    winston = require('winston');

module.exports = function(configuration) {
    return {
        code: 'install_tint',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tintId',
                description: 'The unique id of the tint',
                required: true
            },
            {
                key: 'tintUri',
                description: 'The Uri pointing to the tint git repository.',
                required: true
            },
            {
                key: 'tintType',
                description: 'The type of tint we are installing. Can be stack, edu or data',
                required: true
            },
            {
                key: 'username',
                description: 'The username which has access to the tint',
                required: false
            },
            {
                key: 'password',
                description: 'The password of the user having access to the tint',
                required: false
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(scope) {
            var deferred = Q.defer();

            // -- replace the username and password in the tint uri
            scope.tintUri = scope.tintUri.replace(/%username%/g, scope.username);
            scope.tintUri = scope.tintUri.replace(/%password%/g, scope.password);

            var verbose = false;
            if (scope.verbose) {
                verbose = (scope.verbose == 'yes') || (scope.verbose == 'true');
            }

            var flow = [];

            winston.log('info', 'determining the flow of functions to invoke');
            if (scope.tintType == 'stack') {
                // -- Initialize the container
                flow.push(function(callback) {
                    Lxc.initializeContainers(scope).then(function() {
                        callback();
                    }).fail(function(error) {
                        callback(error)
                    });
                });

                winston.log('info', 'added the LXC container initialization');
            }

            flow.push(function(callback) {
                var pb = new Ansible.Playbook()
                    .inventory('/opt/bb/hosts')
                    .playbook('install')
                    .variables(scope);

                if (verbose) pb.verbose('vvvv');

                pb.exec({cwd: '/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId})
                    .then(function(result) {
                        if (result.code != 0) callback(new Error(result.code));
                        else callback();
                    }, function(error) {
                        callback(error);
                    }, function(progress) {
                        deferred.notify(progress);
                    });
            });
            winston.log('info', 'added the tint playbook execution');

            async.series(flow, function(error) {
                winston.log('info', 'installation callback reached');
                try {
                    if (error) {
                        winston.log('warn', 'it seems an error has occurred: ' + error);
                        deferred.reject(error);
                    } else {
                        winston.log('info', 'installed the ' + scope.tintId + ' tint');
                        deferred.resolve();
                    }
                } catch (error) {
                    deferred.reject(error);
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